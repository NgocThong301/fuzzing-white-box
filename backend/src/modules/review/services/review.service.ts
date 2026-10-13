/**
 * REVIEW SERVICE
 * =============
 * 
 * Xử lý đánh giá seller sau khi order COMPLETED
 */

import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { ReviewStatus, OrderStatus } from '@prisma/client';

export interface CreateReviewDto {
  orderId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  orderId: number;
  reviewerId: number;
  targetUserId: number;
  rating: number;
  comment: string | null;
  response: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerRating {
  userId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tạo review mới
   * Chỉ buyer mới được review và chỉ khi order COMPLETED
   */
  async createReview(userId: number, dto: CreateReviewDto): Promise<ReviewResponse> {
    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Lấy order info
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify buyer
    if (order.buyerId !== userId) {
      throw new ForbiddenException('Only buyer can review this order');
    }

    // Verify order COMPLETED
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed orders');
    }

    // Lấy seller (từ listing đầu tiên)
    const sellerId = order.items[0]?.listing?.sellerId;
    if (!sellerId) {
      throw new BadRequestException('Seller not found');
    }

    // Check duplicate review
    const existingReview = await this.prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId: dto.orderId,
          reviewerId: userId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this order');
    }

    // Tạo review
    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        reviewerId: userId,
        targetUserId: sellerId,
        rating: dto.rating,
        comment: dto.comment,
        status: ReviewStatus.APPROVED, // Auto-approve for simplicity
      },
    });

    // Notify seller
    await this.notificationService.createNotification({
      userId: sellerId,
      type: 'REVIEW_RECEIVED',
      title: 'Bạn có đánh giá mới',
      message: `Người mua đã đánh giá đơn hàng #${order.orderNumber} với ${dto.rating} sao`,
      data: { reviewId: review.id, orderId: order.id },
    });

    // Update seller reputation
    await this.updateSellerReputation(sellerId);

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.REVIEW_CREATED,
      entityType: 'Review',
      entityId: review.id.toString(),
      newData: { orderId: dto.orderId, rating: dto.rating },
    });

    return review;
  }

  /**
   * Lấy review của một user (seller)
   */
  async getReviewsByUser(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          targetUserId: userId,
          status: ReviewStatus.APPROVED,
        },
        include: {
          reviewer: {
            select: { id: true, fullName: true, avatar: true },
          },
          order: {
            select: { id: true, orderNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { targetUserId: userId, status: ReviewStatus.APPROVED },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy rating của seller
   */
  async getSellerRating(userId: number): Promise<SellerRating> {
    // Lấy tất cả reviews approved
    const reviews = await this.prisma.review.findMany({
      where: {
        targetUserId: userId,
        status: ReviewStatus.APPROVED,
      },
      select: { rating: true },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        userId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Tính trung bình
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / totalReviews).toFixed(1));

    // Đếm distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      userId,
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  /**
   * Cập nhật điểm reputation của seller
   */
  async updateSellerReputation(userId: number): Promise<void> {
    // Lấy thống kê reviews
    const reviews = await this.prisma.review.findMany({
      where: {
        targetUserId: userId,
        status: ReviewStatus.APPROVED,
      },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Number((sum / totalReviews).toFixed(2));
    }

    // Lấy số đơn hàng đã hoàn thành
    const completedOrders = await this.prisma.order.count({
      where: {
        items: {
          some: {
            listing: {
              sellerId: userId,
            },
          },
        },
        status: OrderStatus.COMPLETED,
      },
    });

    // Tính response rate (sellers có phản hồi trong 24h)
    // Đơn giản hóa: 100% nếu có phản hồi, 80% nếu không
    const hasResponse = await this.prisma.review.findFirst({
      where: {
        targetUserId: userId,
        response: { not: null },
      },
    });
    const responseRate = hasResponse ? 100 : 80;

    // Cập nhật user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        reputationScore: averageRating,
        totalSales: completedOrders,
        responseRate,
      },
    });
  }

  /**
   * Lấy thông tin reputation đầy đủ của seller
   */
  async getSellerReputation(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationScore: true,
        totalSales: true,
        responseRate: true,
        createdAt: true,
      },
    });

    const ratingStats = await this.getSellerRating(userId);

    // Calculate response time (simplified)
    const responseTime = user?.reputationScore && user.reputationScore >= 4 ? '< 1 giờ' : '1-24 giờ';

    return {
      userId,
      reputationScore: user?.reputationScore || 0,
      totalSales: user?.totalSales || 0,
      responseRate: user?.responseRate || 100,
      averageRating: ratingStats.averageRating,
      totalReviews: ratingStats.totalReviews,
      ratingDistribution: ratingStats.ratingDistribution,
      memberSince: user?.createdAt,
      responseTime,
      level: this.calculateSellerLevel(user?.reputationScore || 0, user?.totalSales || 0),
    };
  }

  /**
   * Tính cấp độ seller dựa trên score và sales
   */
  private calculateSellerLevel(reputationScore: number, totalSales: number): string {
    if (reputationScore >= 4.5 && totalSales >= 100) return 'Diamond';
    if (reputationScore >= 4.0 && totalSales >= 50) return 'Gold';
    if (reputationScore >= 3.5 && totalSales >= 20) return 'Silver';
    if (reputationScore >= 3.0 && totalSales >= 5) return 'Bronze';
    return 'New Seller';
  }

  /**
   * Moderator: Lấy tất cả reviews
   */
  async getAllReviews(page = 1, limit = 10, status?: ReviewStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: { select: { id: true, fullName: true, email: true } },
          targetUser: { select: { id: true, fullName: true, email: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Moderator: Duyệt review
   */
  async moderateReview(
    reviewId: number,
    action: 'APPROVE' | 'REJECT' | 'HIDE',
    moderatorId: number,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const newStatus = action === 'APPROVE' ? ReviewStatus.APPROVED
      : action === 'REJECT' ? ReviewStatus.REJECTED
      : ReviewStatus.HIDDEN;

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status: newStatus },
    });

    // Notify reviewer
    await this.notificationService.createNotification({
      userId: review.reviewerId,
      type: 'REVIEW_APPROVED',
      title: 'Đánh giá đã được duyệt',
      message: `Đánh giá của bạn cho đơn hàng đã được ${action === 'APPROVE' ? 'duyệt' : action === 'REJECT' ? 'từ chối' : 'ẩn'}`,
      data: { reviewId },
    });

    await this.auditLog.log({
      userId: moderatorId,
      action: AuditAction.REVIEW_MODERATED,
      entityType: 'Review',
      entityId: reviewId.toString(),
      oldData: { status: review.status },
      newData: { status: newStatus },
    });

    return updated;
  }

  /**
   * Seller phản hồi review
   */
  async respondToReview(
    reviewId: number,
    userId: number,
    response: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.targetUserId !== userId) {
      throw new ForbiddenException('Only the seller can respond to this review');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { response },
    });

    await this.auditLog.log({
      userId,
      action: AuditAction.REVIEW_RESPONSE,
      entityType: 'Review',
      entityId: reviewId.toString(),
      newData: { response },
    });

    return updated;
  }
}
