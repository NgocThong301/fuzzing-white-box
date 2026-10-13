/**
 * VNPAY PAYMENT CONTROLLER
 * ========================
 *
 * Handles VNPAY Sandbox payment endpoints:
 * - POST /payments/vnpay/create - Create payment URL
 * - GET /payments/vnpay/return - Handle return from VNPAY
 * - GET /payments/vnpay/ipn - Handle IPN (server-to-server)
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { IsNumber } from 'class-validator';
import { VnpayGateway } from '../gateway';
import { PaymentService } from '../services';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';

class CreateVnpayPaymentDto {
  @IsNumber()
  orderId: number;
}

@ApiTags('Payments - VNPAY')
@Controller('payments/vnpay')
export class VnpayController {
  constructor(
    private readonly vnpayGateway: VnpayGateway,
    private readonly paymentService: PaymentService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create VNPAY payment URL' })
  @ApiResponse({ status: 200, description: 'Payment URL created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPayment(
    @Body() dto: CreateVnpayPaymentDto,
    @CurrentUser() user: { id: number },
    @Req() req: Request,
  ) {
    const { orderId } = dto;
    const userId = user.id;

    // Create payment URL (includes validation and payment creation)
    const result = await this.paymentService.createVnpayPayment(
      orderId,
      userId,
      req.ip || '127.0.0.1',
    );

    return {
      paymentId: result.paymentId,
      paymentUrl: result.paymentUrl,
      txnRef: result.txnRef,
      expiresAt: result.expiresAt,
    };
  }

  @Get('return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle VNPAY return URL (user redirect)' })
  @ApiResponse({ status: 200, description: 'Payment result processed' })
  async handleReturn(@Query() query: Record<string, string>) {
    // Get IP address from forwarded header if behind proxy
    const clientIp = this.getClientIpFromHeaders(query);

    // Process the return
    const result = await this.paymentService.handleVnpayReturn(query, clientIp);

    // Redirect to frontend with result
    return {
      success: result.success,
      message: result.message,
      orderId: result.orderId,
      paymentId: result.paymentId,
      amount: result.amount,
      responseCode: result.responseCode,
    };
  }

  @Get('ipn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle VNPAY IPN (server-to-server notification)' })
  @ApiResponse({ status: 200, description: 'IPN processed successfully' })
  async handleIpn(@Query() query: Record<string, string>) {
    // Get IP address for logging
    const clientIp = this.getClientIpFromHeaders(query);

    // Process the IPN
    const result = await this.paymentService.handleVnpayIpn(query, clientIp);

    // Return RPS response format for VNPAY
    // VNPAY expects: vnp_ResponseCode=00 for success
    if (result.success) {
      return {
        vnp_ResponseCode: '00',
        vnp_TxnRef: result.txnRef,
        vnp_TransactionNo: result.transactionNo,
      };
    } else {
      return {
        vnp_ResponseCode: result.responseCode || '99',
        vnp_TxnRef: result.txnRef,
        vnp_TransactionNo: result.transactionNo,
      };
    }
  }

  /**
   * Get client IP from query or headers
   * VNPAY IPN sometimes includes vnp_IpAddr in query
   */
  private getClientIpFromHeaders(query: Record<string, string>): string {
    // VNPAY sends IP address in vnp_IpAddr parameter
    if (query.vnp_IpAddr) {
      return query.vnp_IpAddr;
    }
    return '127.0.0.1';
  }
}
