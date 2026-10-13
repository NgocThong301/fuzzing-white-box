/**
 * COUPON CONTROLLER
 */

import {
  Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from '../services/coupon.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate coupon trước khi checkout' })
  async validateCoupon(
    @Body() body: { code: string; orderAmount: number },
    @CurrentUser() user: any,
  ) {
    return this.couponService.validateCoupon(body.code, user.id, body.orderAmount);
  }
}

@ApiTags('Admin - Coupons')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách coupon' })
  async getCoupons(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.couponService.getCoupons(page || 1, limit || 10);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Tạo coupon mới' })
  async createCoupon(
    @Body() body: {
      code: string;
      description?: string;
      discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      perUserLimit?: number;
      validFrom: string;
      validUntil: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.couponService.createCoupon(user.id, {
      ...body,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
    });
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Cập nhật coupon' })
  async updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive?: boolean; description?: string },
    @CurrentUser() user: any,
  ) {
    return this.couponService.updateCoupon(id, user.id, body);
  }
}
