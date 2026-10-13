/**
 * BANKING PAYMENT CONTROLLER
 * ==========================
 *
 * Handles bank transfer payment endpoints:
 * - POST /payments/banking/create - Create banking payment
 * - GET /payments/banking/accounts - Get bank account info for display
 * - POST /payments/banking/confirm - User confirms bank transfer
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services';
import { BankingPaymentGateway } from '../gateway';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

class CreateBankingPaymentDto {
  orderId: number;
}

class ConfirmBankingPaymentDto {
  paymentId: number;
  bankTransferRef: string;
}

@ApiTags('Payments - Banking')
@Controller('payments/banking')
export class BankingController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly bankingGateway: BankingPaymentGateway,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create banking payment and get transfer details' })
  @ApiResponse({ status: 200, description: 'Banking payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createBankingPayment(
    @Body() dto: CreateBankingPaymentDto,
    @CurrentUser() user: { id: number },
  ) {
    const { orderId } = dto;
    const userId = user.id;

    // Create banking payment and get transaction reference
    const result = await this.paymentService.createBankingPayment(orderId, userId);

    // Get bank accounts for display
    const bankAccounts = this.bankingGateway.getBankAccounts();

    return {
      paymentId: result.paymentId,
      orderId: result.orderId,
      transactionRef: result.transactionRef,
      amount: result.amount,
      orderNumber: result.orderNumber,
      expiresAt: result.expiresAt,
      bankAccounts,
      message: 'Vui lòng chuyển khoản theo thông tin bên dưới và nhấn "Đã chuyển khoản"',
    };
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get bank account information for display' })
  @ApiResponse({ status: 200, description: 'Bank accounts retrieved' })
  async getBankAccounts() {
    const bankAccounts = this.bankingGateway.getBankAccounts();
    return {
      accounts: bankAccounts,
    };
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User confirms bank transfer' })
  @ApiResponse({ status: 200, description: 'Confirmation received' })
  @ApiResponse({ status: 400, description: 'Invalid transfer reference' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmBankingPayment(
    @Body() dto: ConfirmBankingPaymentDto,
    @CurrentUser() user: { id: number },
  ) {
    const { paymentId, bankTransferRef } = dto;
    const userId = user.id;

    // Validate bank transfer reference format
    const validation = this.bankingGateway.validateBankTransferRef(bankTransferRef);
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    // Confirm the payment
    const result = await this.paymentService.confirmBankingPayment(
      paymentId,
      validation.transactionRef!,
      userId,
    );

    return {
      success: true,
      message: 'Đã gửi yêu cầu xác nhận. Vui lòng chờ quản trị viên xác nhận.',
      paymentId: result.paymentId,
      status: result.status,
    };
  }

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banking payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async getPaymentStatus(
    @Param('paymentId') paymentId: number,
    @CurrentUser() user: { id: number },
  ) {
    const result = await this.paymentService.getBankingPaymentStatus(paymentId, user.id);
    return result;
  }
}
