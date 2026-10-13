/**
 * ADMIN PAYMENT CONTROLLER
 * =======================
 *
 * API endpoints cho admin quản lý payments
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentService } from '../services';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Admin - Payments')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminPaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':id/refund')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Refund payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  async refundPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.paymentService.refundPayment(id, user.id, body.reason);
  }

  @Get('banking')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all pending banking payments' })
  @ApiResponse({ status: 200, description: 'Banking payments list' })
  async getBankingPayments(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    // Get all banking payments with PENDING status
    const where: any = {
      method: PaymentMethod.BANKING,
    };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: {
                select: { id: true, fullName: true, email: true },
              },
              seller: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        orderNumber: p.order.orderNumber,
        amount: Number(p.amount),
        status: p.status,
        transactionRef: p.transactionId,
        bankTransferRef: p.bankTransferRef,
        buyer: p.order.buyer,
        seller: p.order.seller,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Post('banking/:id/approve')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Approve banking payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment approved' })
  async approveBankingPayment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.approveBankingPayment(id, user.id);
  }

  @Post('banking/:id/reject')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Reject banking payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment rejected' })
  async rejectBankingPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.paymentService.rejectBankingPayment(id, user.id, body.reason);
  }
}
