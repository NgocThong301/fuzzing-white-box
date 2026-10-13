/**
 * PAYMENT SERVICE
 * ===============
 *
 * Xử lý các nghiệp vụ liên quan đến thanh toán
 * Hỗ trợ COD, Mock Online Payment và VNPAY Sandbox
 *
 * ⚠️  LƯU Ý QUAN TRỌNG:
 * - KHÔNG lưu thông tin thẻ
 * - Backend tự tính amount từ Order
 * - Validate transaction
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { MockPaymentGateway, VnpayGateway, BankingPaymentGateway } from '../gateway';
import { CreatePaymentDto, MockPaymentCallbackDto } from '../dto';
import { PaymentMethod, PaymentStatus, OrderStatus, NotificationType, NotificationStatus, EscrowStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export interface VnpayPaymentResult {
  paymentId: number;
  paymentUrl: string;
  txnRef: string;
  expiresAt: Date;
}

export interface VnpayCallbackResult {
  success: boolean;
  message: string;
  orderId?: number;
  paymentId?: number;
  amount?: number;
  responseCode: string;
  txnRef?: string;
  transactionNo?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly mockGateway: MockPaymentGateway,
    private readonly vnpayGateway: VnpayGateway,
    private readonly bankingGateway: BankingPaymentGateway,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tạo payment mới cho order
   * - Với COD: Tạo payment và cập nhật order
   * - Với Mock Online: Tạo payment session với gateway
   */
  async createPayment(userId: number, dto: CreatePaymentDto) {
    const { orderId, method } = dto;

    // 1. Get order và verify ownership
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user là buyer hoặc admin
    if (order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to make payment for this order');
    }

    // 2. Verify order có thể thanh toán
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order cannot be paid. Invalid status.');
    }

    // 3. Check xem đã có payment chưa
    const existingPayment = order.payments.find(
      (p) => p.status === PaymentStatus.SUCCESS || p.status === PaymentStatus.PENDING,
    );
    
    if (existingPayment) {
      throw new ConflictException('Payment already exists for this order');
    }

    // 4. Sử dụng amount từ Order - KHÔNG tin tưởng client
    const amount = Number(order.finalAmount);

    if (amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // 5. Tạo payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method,
        amount,
        status: PaymentStatus.PENDING,
      },
    });

    // 6. Nếu là COD -> xử lý thanh toán ngay
    if (method === PaymentMethod.COD) {
      return this.processCODPayment(payment.id, userId);
    }

    // 7. Nếu là VNPAY_SANDBOX -> tạo VNPAY payment URL
    if (method === PaymentMethod.VNPAY_SANDBOX) {
      return this.createVnpayPayment(orderId, userId, '127.0.0.1');
    }

    // 8. Nếu là Mock Online -> tạo session với gateway
    return this.createMockOnlinePayment(payment.id, orderId, amount, userId);
  }

  /**
   * Xử lý thanh toán COD
   */
  async processCODPayment(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in PENDING status');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Tạo notification cho seller
    if (payment.order.sellerId) {
      await this.prisma.notification.create({
        data: {
          userId: payment.order.sellerId,
          type: NotificationType.PAYMENT_RECEIVED,
          title: 'Đơn hàng đã được xác nhận',
          message: `Đơn hàng #${payment.order.orderNumber} đã được thanh toán COD`,
          status: NotificationStatus.UNREAD,
        },
      });
    }

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_COD_SUCCESS,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
        amount: Number(payment.amount),
        method: 'COD',
      },
    });

    return {
      payment: updatedPayment,
      orderStatus: OrderStatus.CONFIRMED,
    };
  }

  /**
   * Tạo mock online payment session
   */
  async createMockOnlinePayment(
    paymentId: number,
    orderId: number,
    amount: number,
    userId: number,
  ) {
    const session = await this.mockGateway.createPaymentSession({
      paymentId,
      orderId,
      amount,
      callbackUrl: `/api/payments/callback/${paymentId}`,
      timestamp: new Date().toISOString(),
    });

    // Update payment với gateway response
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        gatewayResponse: {
          gatewayPaymentId: session.gatewayPaymentId,
          checkoutUrl: session.checkoutUrl,
          expiresAt: session.expiresAt,
        } as any,
      },
    });

    return {
      paymentId,
      checkoutUrl: session.checkoutUrl,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Handle callback từ mock gateway
   * Được gọi bởi frontend sau khi user chọn SUCCESS/FAILED/CANCELLED
   */
  async handleMockCallback(
    paymentId: number,
    callback: MockPaymentCallbackDto,
    userId: number,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 1. Verify ownership
    if (payment.order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to process this payment');
    }

    // 2. Check payment status
    if (payment.status !== PaymentStatus.PENDING) {
      // Đã xử lý rồi - trả về thành công (idempotent)
      if (payment.status === PaymentStatus.SUCCESS) {
        return {
          success: true,
          message: 'Payment already processed',
          payment,
        };
      }
      throw new ConflictException('Payment has already been processed');
    }

    // 3. Verify amount (KHÔNG tin tưởng client)
    if (payment.amount !== payment.order.finalAmount) {
      throw new BadRequestException('Amount mismatch detected');
    }

    // 4. Create mock callback với signature
    const mockCallback = this.mockGateway.createMockCallback(
      paymentId,
      (payment.gatewayResponse as any)?.gatewayPaymentId || 'MOCK_GW_001',
      callback.status,
      callback.failureReason,
    );

    // 5. Verify với gateway
    const verified = await this.mockGateway.processCallback(mockCallback);
    if (!verified.verified) {
      throw new BadRequestException(`Gateway verification failed: ${verified.error}`);
    }

    // 6. Process the callback
    return this.processMockCallbackResult(paymentId, callback, userId);
  }

  /**
   * Xử lý kết quả mock callback
   */
  private async processMockCallbackResult(
    paymentId: number,
    callback: MockPaymentCallbackDto,
    userId: number,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    switch (callback.status) {
      case 'SUCCESS':
        return this.completeMockPayment(paymentId, callback.transactionId, userId);
        
      case 'FAILED':
        return this.failMockPayment(paymentId, callback.failureReason, userId);
        
      case 'CANCELLED':
        return this.cancelMockPayment(paymentId, userId);
        
      default:
        throw new BadRequestException('Invalid payment status');
    }
  }

  /**
   * Hoàn tất thanh toán mock thành công
   */
  protected async completeMockPayment(
    paymentId: number,
    transactionId: string | undefined,
    userId: number,
  ) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId: transactionId || this.mockGateway.generateTransactionId(),
        paidAt: new Date(),
        completedAt: new Date(),
      },
      include: { order: true },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Notification cho seller
    if (payment.order.sellerId) {
      await this.prisma.notification.create({
        data: {
          userId: payment.order.sellerId,
          type: NotificationType.PAYMENT_RECEIVED,
          title: 'Thanh toán thành công',
          message: `Đơn hàng #${payment.order.orderNumber} đã được thanh toán`,
          status: NotificationStatus.UNREAD,
        },
      });
    }

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_MOCK_SUCCESS,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
        amount: Number(payment.amount),
        transactionId: payment.transactionId,
        method: 'MOCK_ONLINE',
      },
    });

    return {
      success: true,
      message: 'Payment completed successfully',
      payment,
      orderStatus: OrderStatus.CONFIRMED,
    };
  }

  /**
   * Đánh dấu thanh toán mock thất bại
   */
  protected async failMockPayment(
    paymentId: number,
    failureReason: string | undefined,
    userId: number,
  ) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason,
        completedAt: new Date(),
      },
      include: { order: true },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_MOCK_FAILED,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      oldData: { status: PaymentStatus.PENDING },
      newData: {
        orderId: payment.orderId,
        failureReason,
      },
    });

    return {
      success: false,
      message: 'Payment failed',
      payment,
    };
  }

  /**
   * Hủy thanh toán mock
   */
  protected async cancelMockPayment(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        completedAt: new Date(),
      },
      include: { order: true },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_MOCK_CANCELLED,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
      },
    });

    return {
      success: false,
      message: 'Payment cancelled by user',
      payment,
    };
  }

  /**
   * Verify payment transaction
   * Endpoint để verify sau khi payment hoàn tất
   */
  async verifyPayment(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify ownership
    if (payment.order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to verify this payment');
    }

    // Nếu là mock online, verify với gateway
    if (payment.method === PaymentMethod.MOCK_ONLINE) {
      const gatewayPaymentId = (payment.gatewayResponse as any)?.gatewayPaymentId;
      if (gatewayPaymentId) {
        const verified = await this.mockGateway.verifyTransaction(
          gatewayPaymentId,
          Number(payment.amount),
        );
        
        if (!verified.valid) {
          throw new BadRequestException(`Transaction verification failed: ${verified.error}`);
        }
      }
    }

    // Verify amount match
    if (payment.amount !== payment.order.finalAmount) {
      throw new BadRequestException('Amount tampering detected');
    }

    return {
      valid: true,
      payment,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Confirm sandbox payment (VNPAY/Banking demo mode)
   */
  async confirmSandboxPayment(paymentId: number, userId: number, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify ownership
    if (payment.order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to confirm this payment');
    }

    // Check if already confirmed
    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'Payment already confirmed',
        payment,
      };
    }

    // For sandbox mode, skip strict transaction ID verification
    // In production, this would be more strict
    const gatewayResponse = payment.gatewayResponse as any;
    const isSandboxMode = gatewayResponse?.sandbox || gatewayResponse?.gatewayPaymentId?.startsWith('MOCK_GW_001');

    // Verify transaction ID matches if provided and not sandbox mode
    if (transactionId && !isSandboxMode && payment.transactionId !== transactionId) {
      throw new BadRequestException('Invalid transaction ID');
    }

    // Update payment status to SUCCESS
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        completedAt: new Date(),
        transactionId: transactionId || payment.transactionId || `SANDBOX_${Date.now()}`,
        gatewayResponse: {
          ...(payment.gatewayResponse as object || {}),
          confirmedAt: new Date().toISOString(),
          sandboxConfirmed: true,
        } as any,
      },
      include: { order: true },
    });

    // Update order status to CONFIRMED
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_CONFIRMED,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
      },
    });

    // Create notification for seller
    await this.prisma.notification.create({
      data: {
        userId: payment.order.sellerId!,
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Đơn hàng mới',
        message: `Đơn hàng #${payment.order.orderNumber} đã được thanh toán`,
        status: NotificationStatus.UNREAD,
      },
    });

    return {
      success: true,
      message: 'Thanh toán thành công (Sandbox Mode)',
      payment: updatedPayment,
    };
  }

  /**
   * Lấy thông tin payment
   */
  async getPaymentById(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            buyerId: true,
            sellerId: true,
            finalAmount: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify ownership (buyer hoặc seller hoặc admin)
    const isBuyer = payment.order.buyerId === userId;
    const isSeller = payment.order.sellerId === userId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to view this payment');
    }

    return payment;
  }

  /**
   * Lấy payments của một order
   */
  async getPaymentsByOrderId(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to view these payments');
    }

    return order.payments;
  }

  /**
   * Refund payment (Admin only)
   */
  async refundPayment(paymentId: number, adminId: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Can only refund successful payments');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancellationReason: `Refunded: ${reason || 'No reason provided'}`,
      },
    });

    // Restore inventory
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
    });

    for (const item of orderItems) {
      await this.prisma.listing.update({
        where: { id: item.listingId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    // Audit log
    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.PAYMENT_REFUNDED,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      oldData: { status: PaymentStatus.SUCCESS },
      newData: {
        orderId: payment.orderId,
        refundReason: reason,
      },
    });

    return updatedPayment;
  }

  // ========================================
  // VNPAY PAYMENT METHODS
  // ========================================

  /**
   * Create VNPAY payment for an order
   * This creates a payment record and generates a VNPAY payment URL
   */
  async createVnpayPayment(orderId: number, userId: number, clientIp: string): Promise<VnpayPaymentResult> {
    // 1. Get order and verify ownership
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user is buyer
    if (order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to make payment for this order');
    }

    // Verify order status
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order cannot be paid. Invalid status.');
    }

    // 2. Check for existing successful payment
    const existingPayment = order.payments.find(
      (p) => p.status === PaymentStatus.SUCCESS || p.status === PaymentStatus.PENDING,
    );

    if (existingPayment) {
      throw new ConflictException('Payment already exists for this order');
    }

    // 3. Get amount from order (NEVER trust client)
    const amount = Number(order.finalAmount);

    if (amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // 4. Create payment record (PENDING status)
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method: PaymentMethod.VNPAY_SANDBOX,
        amount,
        status: PaymentStatus.PENDING,
      },
    });

    // 5. Get frontend URL for return/IPN
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const backendUrl = this.configService.get<string>('API_URL', 'http://localhost:3000');

    // 6. Build URLs
    const returnUrl = `${frontendUrl}/payment/vnpay/return`;
    const ipnUrl = `${backendUrl}/api/payments/vnpay/ipn`;

    // 7. Create VNPAY payment URL using the gateway
    // NOTE: For Option A (Internal Sandbox), we redirect to our own sandbox page
    // instead of the external VNPAY sandbox URL
    const vnpayResult = await this.vnpayGateway.createPaymentUrl({
      orderId,
      amount,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      ipAddress: clientIp,
      returnUrl,
      ipnUrl,
    });

    // 8. Update payment with gateway response
    // For Option A: Use internal sandbox page instead of external VNPAY URL
    const sandboxPaymentUrl = `${frontendUrl}/payment/sandbox/${payment.id}?txnRef=${vnpayResult.txnRef}`;
    
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: vnpayResult.txnRef,
        gatewayResponse: {
          txnRef: vnpayResult.txnRef,
          paymentUrl: sandboxPaymentUrl,
          expiresAt: vnpayResult.expiresAt.toISOString(),
          sandbox: true,
          internalSandbox: true,
        } as any,
      },
    });

    // 9. Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_VNPAY_PENDING,
      entityType: 'Payment',
      entityId: payment.id.toString(),
      newData: {
        orderId,
        amount,
        txnRef: vnpayResult.txnRef,
        gateway: 'VNPAY_SANDBOX',
        sandboxMode: 'INTERNAL',
      },
    });

    // 10. Return sandbox payment URL - user will be redirected to internal sandbox page
    return {
      paymentId: payment.id,
      paymentUrl: sandboxPaymentUrl,
      txnRef: vnpayResult.txnRef,
      expiresAt: vnpayResult.expiresAt,
    };
  }

  /**
   * Handle VNPAY return URL (user redirect)
   * This is called when user is redirected back from VNPAY
   */
  async handleVnpayReturn(query: Record<string, string>, clientIp: string): Promise<VnpayCallbackResult> {
    // 1. Verify signature
    const verification = this.vnpayGateway.verifyCallback(query);

    if (!verification.verified) {
      return {
        success: false,
        message: 'Invalid signature',
        responseCode: '97',
      };
    }

    const data = verification.data!;

    // 2. Find payment by txnRef
    const payment = await this.prisma.payment.findFirst({
      where: {
        transactionId: data.vnp_TxnRef,
        method: PaymentMethod.VNPAY_SANDBOX,
      },
      include: { order: true },
    });

    if (!payment) {
      return {
        success: false,
        message: 'Payment not found',
        responseCode: '01',
      };
    }

    // 3. Process payment result
    const result = this.vnpayGateway.processPaymentResult(data);

    // 4. Log the callback (idempotent - already processed payments will be skipped)
    await this.auditLog.log({
      userId: payment.order.buyerId,
      action: AuditAction.PAYMENT_VNPAY_IPN_RECEIVED,
      entityType: 'Payment',
      entityId: payment.id.toString(),
      newData: {
        responseCode: data.vnp_ResponseCode,
        transactionNo: data.vnp_TransactionNo,
        txnRef: data.vnp_TxnRef,
        amount: result.amount,
        source: 'RETURN_URL',
        clientIp,
      },
    });

    // 5. Return result for frontend to display
    return {
      success: result.success,
      message: result.message,
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: result.amount,
      responseCode: data.vnp_ResponseCode,
      txnRef: data.vnp_TxnRef,
      transactionNo: data.vnp_TransactionNo,
    };
  }

  /**
   * Handle VNPAY IPN (server-to-server notification)
   * This is the authoritative source for payment confirmation
   */
  async handleVnpayIpn(query: Record<string, string>, clientIp: string): Promise<VnpayCallbackResult> {
    // 1. Verify signature
    const verification = this.vnpayGateway.verifyCallback(query);

    if (!verification.verified) {
      // Log failed verification
      await this.auditLog.log({
        action: AuditAction.PAYMENT_VNPAY_IPN_RECEIVED,
        entityType: 'Payment',
        entityId: 'UNKNOWN',
        newData: {
          error: 'Invalid signature',
          clientIp,
          source: 'IPN',
        },
      });

      return {
        success: false,
        message: 'Invalid signature',
        responseCode: '97',
      };
    }

    const data = verification.data!;

    // 2. Find payment by txnRef
    const payment = await this.prisma.payment.findFirst({
      where: {
        transactionId: data.vnp_TxnRef,
        method: PaymentMethod.VNPAY_SANDBOX,
      },
      include: { order: true },
    });

    if (!payment) {
      return {
        success: false,
        message: 'Payment not found',
        responseCode: '01',
        txnRef: data.vnp_TxnRef,
      };
    }

    // 3. Idempotency check - already processed
    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'Payment already processed',
        responseCode: '00',
        orderId: payment.orderId,
        paymentId: payment.id,
        txnRef: data.vnp_TxnRef,
        transactionNo: data.vnp_TransactionNo,
      };
    }

    // 4. Verify amount (CRITICAL SECURITY CHECK)
    const paymentResult = this.vnpayGateway.processPaymentResult(data);
    const callbackAmount = paymentResult.amount;
    if (callbackAmount !== Number(payment.amount)) {
      // Amount mismatch - potential tampering
      await this.auditLog.log({
        userId: payment.order.buyerId,
        action: AuditAction.PAYMENT_VNPAY_FAILED,
        entityType: 'Payment',
        entityId: payment.id.toString(),
        newData: {
          error: 'Amount mismatch',
          expected: Number(payment.amount),
          received: callbackAmount,
          txnRef: data.vnp_TxnRef,
          source: 'IPN',
        },
      });

      return {
        success: false,
        message: 'Amount mismatch',
        responseCode: '04',
        txnRef: data.vnp_TxnRef,
      };
    }

    // 5. Update payment within transaction
    await this.prisma.$transaction(async (tx) => {
      if (paymentResult.success) {
        // Update payment to SUCCESS
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayTransactionId: data.vnp_TransactionNo,
            gatewayResponseCode: data.vnp_ResponseCode,
            gatewayResponseMessage: paymentResult.message,
            gatewayResponse: data as any,
            paidAt: new Date(),
            completedAt: new Date(),
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CONFIRMED },
        });

        // Create escrow for seller
        await this.createEscrowForPayment(tx, payment.orderId, payment.order.buyerId);

        // Audit log
        await this.auditLog.log({
          userId: payment.order.buyerId,
          action: AuditAction.PAYMENT_VNPAY_SUCCESS,
          entityType: 'Payment',
          entityId: payment.id.toString(),
          newData: {
            orderId: payment.orderId,
            amount: Number(payment.amount),
            transactionNo: data.vnp_TransactionNo,
            responseCode: data.vnp_ResponseCode,
            source: 'IPN',
          },
        });

        // Notification for seller
        if (payment.order.sellerId) {
          await tx.notification.create({
            data: {
              userId: payment.order.sellerId,
              type: NotificationType.PAYMENT_RECEIVED,
              title: 'Thanh toán thành công qua VNPAY',
              message: `Đơn hàng #${payment.order.orderNumber} đã được thanh toán`,
              status: NotificationStatus.UNREAD,
            },
          });
        }
      } else {
        // Payment failed or cancelled
        const newStatus = paymentResult.responseCode === '24'
          ? PaymentStatus.CANCELLED
          : PaymentStatus.FAILED;

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            gatewayResponseCode: data.vnp_ResponseCode,
            gatewayResponseMessage: paymentResult.message,
            gatewayResponse: data as any,
            failureReason: paymentResult.message,
            completedAt: new Date(),
          },
        });

        await this.auditLog.log({
          userId: payment.order.buyerId,
          action: paymentResult.responseCode === '24'
            ? AuditAction.PAYMENT_VNPAY_CANCELLED
            : AuditAction.PAYMENT_VNPAY_FAILED,
          entityType: 'Payment',
          entityId: payment.id.toString(),
          newData: {
            orderId: payment.orderId,
            responseCode: data.vnp_ResponseCode,
            message: paymentResult.message,
            source: 'IPN',
          },
        });
      }
    });

    return {
      success: paymentResult.success,
      message: paymentResult.message,
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: Number(payment.amount),
      responseCode: data.vnp_ResponseCode,
      txnRef: data.vnp_TxnRef,
      transactionNo: data.vnp_TransactionNo,
    };
  }

  /**
   * Create escrow transaction for successful payment
   */
  private async createEscrowForPayment(
    tx: any,
    orderId: number,
    buyerId: number,
  ): Promise<void> {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      return;
    }

    // Check if escrow already exists
    const existingEscrow = await tx.escrowTransaction.findUnique({
      where: { orderId },
    });

    if (existingEscrow) {
      return; // Idempotent - already created
    }

    // Calculate platform fee (5%)
    const platformFee = Math.round(Number(order.finalAmount) * 0.05);

    // Get seller from first item
    const sellerId = order.items[0]?.listing?.sellerId;

    if (!sellerId) {
      return;
    }

    // Create escrow
    await tx.escrowTransaction.create({
      data: {
        orderId,
        sellerId,
        buyerId,
        amount: order.finalAmount,
        platformFee,
        status: EscrowStatus.FUNDED,
        fundedAt: new Date(),
      },
    });

    await this.auditLog.log({
      userId: buyerId,
      action: AuditAction.ESCROW_CREATED,
      entityType: 'EscrowTransaction',
      entityId: orderId.toString(),
      newData: {
        orderId,
        amount: Number(order.finalAmount),
        platformFee,
        source: 'VNPAY_PAYMENT',
      },
    });
  }

  // ========================================
  // BANKING PAYMENT METHODS
  // ========================================

  /**
   * Create banking payment and generate transaction reference
   */
  async createBankingPayment(
    orderId: number,
    userId: number,
  ) {
    // 1. Get order and verify ownership
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user is buyer
    if (order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to make payment for this order');
    }

    // Verify order status
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order cannot be paid. Invalid status.');
    }

    // 2. Check for existing payment
    const existingPayment = order.payments.find(
      (p) => p.status === PaymentStatus.SUCCESS || p.status === PaymentStatus.PENDING,
    );

    if (existingPayment) {
      // If there's already a banking payment with transaction ref, return it
      if (existingPayment.method === PaymentMethod.BANKING) {
        const bankAccounts = this.bankingGateway.getBankAccounts();
        return {
          paymentId: existingPayment.id,
          transactionRef: existingPayment.transactionId || '',
          amount: Number(existingPayment.amount),
          orderNumber: order.orderNumber,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          bankAccounts,
        };
      }
      throw new ConflictException('Payment already exists for this order');
    }

    // 3. Get amount from order
    const amount = Number(order.finalAmount);

    if (amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // 4. Generate transaction reference
    const txnRef = this.bankingGateway.generateTransactionRef({
      orderId,
      amount,
      orderNumber: order.orderNumber,
    });

    // 5. Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method: PaymentMethod.BANKING,
        amount,
        status: PaymentStatus.PENDING,
        transactionId: txnRef.transactionRef,
      },
    });

    // 6. Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_VNPAY_PENDING, // Reuse audit action
      entityType: 'Payment',
      entityId: payment.id.toString(),
      newData: {
        orderId,
        amount,
        transactionRef: txnRef.transactionRef,
        method: 'BANKING',
      },
    });

    return {
      paymentId: payment.id,
      orderId: orderId,
      transactionRef: txnRef.transactionRef,
      amount,
      orderNumber: order.orderNumber,
      expiresAt: txnRef.expiresAt,
    };
  }

  /**
   * Confirm banking payment (user enters transfer reference)
   */
  async confirmBankingPayment(
    paymentId: number,
    bankTransferRef: string,
    userId: number,
  ) {
    // 1. Get payment
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Verify ownership
    if (payment.order.buyerId !== userId) {
      throw new ForbiddenException('You do not have permission to confirm this payment');
    }

    // 3. Verify payment method
    if (payment.method !== PaymentMethod.BANKING) {
      throw new BadRequestException('This is not a banking payment');
    }

    // 4. Check payment status
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment has already been processed');
    }

    // 5. Update payment with bank transfer reference
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        bankTransferRef,
        gatewayResponse: {
          bankTransferRef,
          confirmedAt: new Date().toISOString(),
          confirmedBy: userId,
        } as any,
      },
    });

    // 6. Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.PAYMENT_VNPAY_PENDING, // Reuse audit action
      entityType: 'Payment',
      entityId: payment.id.toString(),
      newData: {
        orderId: payment.orderId,
        bankTransferRef,
        action: 'BANKING_CONFIRMED',
      },
    });

    return {
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      message: 'Đã gửi yêu cầu xác nhận. Vui lòng chờ quản trị viên xác nhận.',
    };
  }

  /**
   * Get banking payment status
   */
  async getBankingPaymentStatus(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            buyerId: true,
            sellerId: true,
            finalAmount: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify ownership (buyer or seller or admin)
    const isBuyer = payment.order.buyerId === userId;
    const isSeller = payment.order.sellerId === userId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to view this payment');
    }

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      amount: Number(payment.amount),
      status: payment.status,
      transactionRef: payment.transactionId,
      bankTransferRef: payment.bankTransferRef,
      method: payment.method,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      isConfirmedByUser: !!payment.bankTransferRef,
      message: this.getBankingStatusMessage(payment.status, !!payment.bankTransferRef),
    };
  }

  /**
   * Admin approve banking payment
   */
  async approveBankingPayment(paymentId: number, adminId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.method !== PaymentMethod.BANKING) {
      throw new BadRequestException('This is not a banking payment');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment has already been processed');
    }

    // Update within transaction
    await this.prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Update order
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });

      // Create escrow
      await this.createEscrowForPayment(tx, payment.orderId, payment.order.buyerId);
    });

    // Notification for seller
    if (payment.order.sellerId) {
      await this.prisma.notification.create({
        data: {
          userId: payment.order.sellerId,
          type: NotificationType.PAYMENT_RECEIVED,
          title: 'Thanh toán chuyển khoản đã được xác nhận',
          message: `Đơn hàng #${payment.order.orderNumber} đã được thanh toán`,
          status: NotificationStatus.UNREAD,
        },
      });
    }

    // Audit log
    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.PAYMENT_VNPAY_SUCCESS,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
        amount: Number(payment.amount),
        bankTransferRef: payment.bankTransferRef,
        action: 'BANKING_APPROVED',
      },
    });

    return {
      success: true,
      message: 'Đã xác nhận thanh toán thành công',
      paymentId,
    };
  }

  /**
   * Admin reject banking payment
   */
  async rejectBankingPayment(
    paymentId: number,
    adminId: number,
    reason: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.method !== PaymentMethod.BANKING) {
      throw new BadRequestException('This is not a banking payment');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment has already been processed');
    }

    // Update payment
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
        completedAt: new Date(),
      },
    });

    // Audit log
    await this.auditLog.log({
      userId: adminId,
      action: AuditAction.PAYMENT_VNPAY_FAILED,
      entityType: 'Payment',
      entityId: paymentId.toString(),
      newData: {
        orderId: payment.orderId,
        reason,
        action: 'BANKING_REJECTED',
      },
    });

    return {
      success: true,
      message: 'Đã từ chối thanh toán',
      paymentId,
      reason,
    };
  }

  /**
   * Get status message for banking payment
   */
  private getBankingStatusMessage(
    status: PaymentStatus,
    isConfirmedByUser: boolean,
  ): string {
    switch (status) {
      case PaymentStatus.PENDING:
        if (isConfirmedByUser) {
          return 'Đã gửi mã chuyển khoản. Đang chờ quản trị viên xác nhận.';
        }
        return 'Chờ bạn xác nhận đã chuyển khoản.';
      case PaymentStatus.SUCCESS:
        return 'Thanh toán đã được xác nhận thành công.';
      case PaymentStatus.FAILED:
        return 'Thanh toán bị từ chối. Vui lòng liên hệ hỗ trợ.';
      case PaymentStatus.CANCELLED:
        return 'Thanh toán đã bị hủy.';
      default:
        return 'Trạng thái không xác định.';
    }
  }
}
