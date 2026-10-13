/**
 * COUPON SERVICE
 * ==============
 * 
 * Xử lý coupon giảm giá
 * Backend tự validate coupon, không tin discount từ frontend
 */

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { DiscountType } from '@prisma/client';

export interface ValidateCouponResult {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedDiscount: number;
  message?: string;
}

@Injectable()
export class CouponService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Validate coupon - được gọi khi checkout
   * KHÔNG tin discount từ frontend
   */
  async validateCoupon(code: string, userId: number, orderAmount: number): Promise<ValidateCouponResult> {
    // Find coupon
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: {
          where: { userId },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check active
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is no longer active');
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestException('Coupon is not valid at this time');
    }

    // Check usage limit (count from usages)
    const totalUsageCount = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id },
    });
    if (coupon.usageLimit !== null && totalUsageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Check per-user limit
    const userUsageCount = coupon.usages.length;
    if (userUsageCount >= coupon.perUserLimit) {
      throw new BadRequestException('You have already used this coupon');
    }

    // Check min order amount
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (orderAmount < minAmount) {
      throw new BadRequestException(`Minimum order amount is ${minAmount.toLocaleString()} VND`);
    }

    // Calculate discount
    let calculatedDiscount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      calculatedDiscount = orderAmount * (Number(coupon.discountValue) / 100);
    } else {
      calculatedDiscount = Number(coupon.discountValue);
    }

    // Apply max discount cap
    const maxDiscount = coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null;
    if (maxDiscount !== null && calculatedDiscount > maxDiscount) {
      calculatedDiscount = maxDiscount;
    }

    // Don't exceed order amount
    if (calculatedDiscount > orderAmount) {
      calculatedDiscount = orderAmount;
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      calculatedDiscount,
      message: `Discount: ${this.formatPrice(calculatedDiscount)}`,
    };
  }

  /**
   * Apply coupon - được gọi khi tạo order
   */
  async applyCoupon(code: string, userId: number, orderId: number, orderAmount: number) {
    // Validate again
    const validation = await this.validateCoupon(code, userId, orderAmount);

    // Update order with coupon
    const couponRecord = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        couponId: couponRecord?.id,
        discountAmount: validation.calculatedDiscount,
      },
      include: { coupon: true },
    });

    // Record usage
    await this.prisma.couponUsage.create({
      data: {
        couponId: order.couponId!,
        userId,
        orderId,
        discount: validation.calculatedDiscount,
      },
    });

    // Update coupon usage count by incrementing usedCount field
    await this.prisma.$executeRaw`
      UPDATE "coupons" SET "used_count" = "used_count" + 1 WHERE id = ${order.couponId!}
    `;

    await this.auditLog.log({
      userId,
      action: AuditAction.COUPON_APPLIED,
      entityType: 'Order',
      entityId: orderId.toString(),
      newData: { couponCode: code, discount: validation.calculatedDiscount },
    });

    return {
      success: true,
      discount: validation.calculatedDiscount,
      newTotal: orderAmount - validation.calculatedDiscount,
    };
  }

  /**
   * Admin: Tạo coupon mới
   */
  async createCoupon(
    adminId: number,
    dto: {
      code: string;
      description?: string;
      discountType: DiscountType;
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      perUserLimit?: number;
      validFrom: Date;
      validUntil: Date;
    },
  ) {
    // Validate
    if (dto.discountType === DiscountType.PERCENTAGE && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Check existing code
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit || 1,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        createdById: adminId,
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.COUPON_CREATED,
      entityType: 'Coupon',
      entityId: coupon.id.toString(),
      newData: { code: coupon.code, discountValue: Number(coupon.discountValue) },
    });

    return coupon;
  }

  /**
   * Admin: Lấy danh sách coupon
   */
  async getCoupons(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      data: coupons,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Admin: Cập nhật coupon
   */
  async updateCoupon(couponId: number, adminId: number, data: { isActive?: boolean; description?: string }) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const updated = await this.prisma.coupon.update({
      where: { id: couponId },
      data,
    });

    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.COUPON_UPDATED,
      entityType: 'Coupon',
      entityId: couponId.toString(),
      oldData: { isActive: coupon.isActive },
      newData: data,
    });

    return updated;
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }
}
