/**
 * PAYMENT CONTROLLER
 * ==================
 * 
 * API endpoints cho thanh toán
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services';
import { CreatePaymentDto, MockPaymentCallbackDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo payment mới' })
  @ApiResponse({ status: 201, description: 'Payment đã được tạo' })
  async createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentService.createPayment(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin payment' })
  @ApiResponse({ status: 200, description: 'Thông tin payment' })
  async getPayment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.paymentService.getPaymentById(id, user.id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Lấy payments của order' })
  @ApiResponse({ status: 200, description: 'Danh sách payments' })
  async getPaymentsByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.getPaymentsByOrderId(orderId, user.id);
  }

  @Post('callback/:id')
  @ApiOperation({ summary: 'Handle mock payment callback' })
  @ApiResponse({ status: 200, description: 'Kết quả callback' })
  async handleCallback(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MockPaymentCallbackDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.handleMockCallback(id, dto, user.id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify payment transaction' })
  @ApiResponse({ status: 200, description: 'Kết quả verify' })
  async verifyPayment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.paymentService.verifyPayment(id, user.id);
  }

  @Post('sandbox/confirm')
  @ApiOperation({ summary: 'Confirm sandbox payment (VNPAY/Banking demo)' })
  @ApiResponse({ status: 200, description: 'Xác nhận thanh toán thành công' })
  async confirmSandboxPayment(
    @Body() body: { paymentId: number; transactionId?: string },
    @CurrentUser() user: any,
  ) {
    return this.paymentService.confirmSandboxPayment(body.paymentId, user.id, body.transactionId);
  }
}
