/**
 * ADMIN SERVICE
 * ============
 * 
 * Dashboard stats, charts, and admin management
 * CHỉ ADMIN MỚI ĐƯỢC TRUY CẬP
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { Prisma, EscrowStatus, OrderStatus, ListingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Dashboard Statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalListings,
      pendingListings,
      totalOrders,
      processingOrders,
      totalRevenue,
      totalTransactions,
      pendingEscrow,
      pendingDisputes,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count({ where: { deletedAt: null } }),
      
      // Total sellers (users who have created listings)
      this.prisma.user.count({
        where: {
          deletedAt: null,
          listings: { some: {} },
        },
      }),
      
      // Total buyers (users who have placed orders)
      this.prisma.user.count({
        where: {
          deletedAt: null,
          orders: { some: {} },
        },
      }),
      
      // Total listings
      this.prisma.listing.count({
        where: {
          status: { in: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SOLD', 'HIDDEN'] },
        },
      }),
      
      // Pending moderation
      this.prisma.listing.count({
        where: { status: ListingStatus.PENDING_REVIEW },
      }),
      
      // Total orders
      this.prisma.order.count(),
      
      // Processing orders (not completed/cancelled)
      this.prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.PENDING_PAYMENT,
              OrderStatus.CONFIRMED,
              OrderStatus.PREPARING,
              OrderStatus.SHIPPING,
              OrderStatus.DELIVERED,
            ],
          },
        },
      }),
      
      // Total revenue (sum of completed payments)
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      
      // Total transactions
      this.prisma.walletTransaction.count(),
      
      // Pending escrow
      this.prisma.escrowTransaction.aggregate({
        where: {
          status: {
            in: [EscrowStatus.FUNDED, EscrowStatus.HELD, EscrowStatus.DISPUTED],
          },
        },
        _sum: { amount: true },
      }),
      
      // Pending disputes
      this.prisma.escrowTransaction.count({
        where: { status: EscrowStatus.DISPUTED },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
      },
      listings: {
        total: totalListings,
        pending: pendingListings,
      },
      orders: {
        total: totalOrders,
        processing: processingOrders,
      },
      revenue: {
        total: Number(totalRevenue._sum.amount) || 0,
      },
      transactions: {
        total: totalTransactions,
      },
      escrow: {
        pending: Number(pendingEscrow._sum.amount) || 0,
      },
      disputes: {
        pending: pendingDisputes,
      },
    };
  }

  /**
   * Revenue by day (last N days)
   */
  async getRevenueByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: { gte: startDate },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    });

    // Group by day
    const revenueByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      revenueByDay[key] = 0;
    }

    payments.forEach((p) => {
      if (p.paidAt) {
        const key = p.paidAt.toISOString().split('T')[0];
        if (revenueByDay[key] !== undefined) {
          revenueByDay[key] += Number(p.amount);
        }
      }
    });

    return Object.entries(revenueByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Orders by day
   */
  async getOrdersByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const ordersByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      ordersByDay[key] = 0;
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split('T')[0];
      if (ordersByDay[key] !== undefined) {
        ordersByDay[key]++;
      }
    });

    return Object.entries(ordersByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * User registrations by day
   */
  async getUserRegistrationsByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        deletedAt: null,
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const registrationsByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      registrationsByDay[key] = 0;
    }

    users.forEach((u) => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (registrationsByDay[key] !== undefined) {
        registrationsByDay[key]++;
      }
    });

    return Object.entries(registrationsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Listings created by day
   */
  async getListingsByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const listings = await this.prisma.listing.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const listingsByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      listingsByDay[key] = 0;
    }

    listings.forEach((l) => {
      const key = l.createdAt.toISOString().split('T')[0];
      if (listingsByDay[key] !== undefined) {
        listingsByDay[key]++;
      }
    });

    return Object.entries(listingsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Top categories by listing count
   */
  async getTopCategories(limit = 10) {
    // Get book count by category
    const booksByCategory = await this.prisma.book.groupBy({
      by: ['categoryId'],
      _count: true,
      orderBy: { _count: { categoryId: 'desc' } },
      take: limit,
    });

    const categoryIds = booksByCategory
      .map((b) => b.categoryId)
      .filter((id): id is number => id !== null);

    if (categoryIds.length === 0) {
      return [];
    }

    const categoryData = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categoryData.map((c) => [c.id, c.name]));

    return booksByCategory.map((b) => ({
      categoryId: b.categoryId,
      categoryName: b.categoryId ? categoryMap.get(b.categoryId) || 'Unknown' : 'N/A',
      count: b._count,
    }));
  }

  /**
   * Top courses by listing count
   */
  async getTopCourses(limit = 10) {
    // Get book count by course
    const booksByCourse = await this.prisma.book.groupBy({
      by: ['courseId'],
      _count: true,
      orderBy: { _count: { courseId: 'desc' } },
      take: limit,
      where: {
        courseId: { not: null },
      },
    });

    const courseIds = booksByCourse
      .map((b) => b.courseId)
      .filter((id): id is number => id !== null);

    if (courseIds.length === 0) {
      return [];
    }

    const courseData = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    const courseMap = new Map(courseData.map((c) => [c.id, c.name]));

    return booksByCourse.map((b) => ({
      courseId: b.courseId,
      courseName: b.courseId ? courseMap.get(b.courseId) || 'Unknown' : 'N/A',
      count: b._count,
    }));
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          status: true,
          createdAt: true,
          university: { select: { id: true, name: true } },
          roles: { include: { role: true } },
          _count: {
            select: {
              listings: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        role: u.roles[0]?.role?.name || 'USER',
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: number, adminId: number, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.USER_DEACTIVATED,
      entityType: 'User',
      entityId: userId.toString(),
      newData: { reason },
    });

    return updated;
  }

  /**
   * Get all listings for admin
   */
  async getListings(page = 1, limit = 20, status?: ListingStatus, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { book: { title: { contains: search, mode: 'insensitive' } } },
        { book: { author: { contains: search, mode: 'insensitive' } } },
        { seller: { fullName: { contains: search, mode: 'insensitive' } } },
        { seller: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          book: { include: { category: true } },
          seller: { select: { id: true, fullName: true, email: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map(l => ({
        id: l.id,
        title: l.book?.title,
        price: l.price,
        quantity: l.quantity,
        condition: l.condition,
        status: l.status,
        description: l.description,
        location: l.location,
        shippingOption: l.shippingOption,
        createdAt: l.createdAt,
        publishedAt: l.publishedAt,
        book: l.book,
        seller: l.seller,
        images: l.images,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Admin edit listing - allows admin to edit any listing info including book details
   */
  async editListing(listingId: number, dto: {
    title?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
    edition?: string;
    publicationYear?: number;
    categoryId?: number;
    price?: string;
    quantity?: number;
    condition?: string;
    description?: string;
    location?: string;
    shippingOption?: string;
  }, adminId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { book: true },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Update book info if provided
    if (dto.title || dto.author || dto.publisher || dto.isbn || dto.edition || dto.publicationYear !== undefined || dto.categoryId !== undefined) {
      await this.prisma.book.update({
        where: { id: listing.bookId },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.author && { author: dto.author }),
          ...(dto.publisher && { publisher: dto.publisher }),
          ...(dto.isbn && { isbn: dto.isbn }),
          ...(dto.edition && { edition: dto.edition }),
          ...(dto.publicationYear !== undefined && { publicationYear: dto.publicationYear }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
        },
      });
    }

    // Update listing info
    const updateData: any = {};
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.condition !== undefined) updateData.condition = dto.condition;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.shippingOption !== undefined) updateData.shippingOption = dto.shippingOption;

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        book: { include: { category: true } },
        seller: { select: { id: true, fullName: true, email: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.LISTING_UPDATED,
      entityType: 'Listing',
      entityId: listingId.toString(),
      oldData: { 
        price: listing.price,
        quantity: listing.quantity,
        bookTitle: listing.book?.title,
      },
      newData: dto,
    });

    return updated;
  }

  /**
   * Get all orders for admin
   */
  async getOrders(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, fullName: true, email: true } },
          seller: { select: { id: true, fullName: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all payments for admin
   */
  async getPayments(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all reviews for admin
   */
  async getReviews(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

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
   * Get all reports for admin
   */
  async getReports(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Resolve report
   */
  async resolveReport(reportId: number, adminId: number, action: 'RESOLVED' | 'DISMISSED', note?: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    
    if (!report) {
      throw new Error('Report not found');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action,
        resolvedAt: new Date(),
        resolution: note,
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.REPORT_RESOLVED,
      entityType: 'Report',
      entityId: reportId.toString(),
      oldData: { status: report.status },
      newData: { status: action, note },
    });

    return updated;
  }
}
