import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../services/payment.service';
import { MockPaymentGateway } from '../gateway';
import { AuditLogService } from 'src/common/services/audit-log.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';

describe('PaymentService - Business Rules', () => {
  let service: PaymentService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockAuditLogService = {
    log: jest.fn(),
  };

  const mockGateway = {
    createPaymentSession: jest.fn(),
    processCallback: jest.fn(),
    verifyTransaction: jest.fn(),
    generateTransactionId: jest.fn(),
    createMockCallback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: MockPaymentGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RULE: Cannot pay for another user's order
  // ============================================
  describe('User cannot pay for another users order', () => {
    it('should throw ForbiddenException when user tries to pay for others order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        status: OrderStatus.PENDING_PAYMENT,
        finalAmount: 100000,
        payments: [],
        sellerId: 2,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createPayment(999, { orderId: 1, method: PaymentMethod.COD }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE: Amount comes from Order, not client
  // ============================================
  describe('Amount validation - Backend calculates amount', () => {
    it('should use amount from Order, not from client', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        status: OrderStatus.PENDING_PAYMENT,
        finalAmount: 150000,
        payments: [],
        sellerId: 2,
        orderNumber: 'ORD-001',
      };

      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.COD,
        amount: 150000,
        status: PaymentStatus.PENDING,
        order,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);
      mockPrismaService.payment.create.mockResolvedValue(payment);
      mockPrismaService.payment.findUnique.mockResolvedValue(payment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.SUCCESS,
      });
      mockPrismaService.order.update.mockResolvedValue({});
      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createPayment(1, { orderId: 1, method: PaymentMethod.COD });

      // Verify that payment was created with Order's amount (150000), not any other value
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 150000,
          }),
        }),
      );
    });
  });

  // ============================================
  // RULE: Duplicate payment prevention
  // ============================================
  describe('Duplicate payment prevention', () => {
    it('should throw ConflictException if payment already exists', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        status: OrderStatus.PENDING_PAYMENT,
        finalAmount: 100000,
        payments: [{ id: 1, status: PaymentStatus.SUCCESS }],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createPayment(1, { orderId: 1, method: PaymentMethod.COD }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ============================================
  // RULE: Invalid order status
  // ============================================
  describe('Invalid order status handling', () => {
    it('should throw BadRequestException for non-pending order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        status: OrderStatus.CONFIRMED,
        finalAmount: 100000,
        payments: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createPayment(1, { orderId: 1, method: PaymentMethod.COD }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE: COD Payment Success
  // ============================================
  describe('COD payment success', () => {
    it('should process COD payment successfully', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.COD,
        amount: 100000,
        status: PaymentStatus.PENDING,
        order: {
          id: 1,
          buyerId: 1,
          sellerId: 2,
          orderNumber: 'ORD-001',
          status: OrderStatus.PENDING_PAYMENT,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.SUCCESS,
      });
      mockPrismaService.order.update.mockResolvedValue({});
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.processCODPayment(1, 1);

      expect(result.payment.status).toBe(PaymentStatus.SUCCESS);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.CONFIRMED },
      });
    });
  });

  // ============================================
  // RULE: Mock Payment Success
  // ============================================
  describe('Mock payment success', () => {
    it('should complete mock payment successfully', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.PENDING,
        gatewayResponse: { gatewayPaymentId: 'MOCK_GW_001-xxx' },
        order: {
          buyerId: 1,
          sellerId: 2,
          orderNumber: 'ORD-001',
        },
      };

      mockPrismaService.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.SUCCESS,
        transactionId: 'TXN-001',
      });
      mockPrismaService.order.update.mockResolvedValue({});
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.completeMockPayment(1, 'TXN-001', 1);

      expect(result.success).toBe(true);
      expect(result.orderStatus).toBe(OrderStatus.CONFIRMED);
    });
  });

  // ============================================
  // RULE: Mock Payment Failed
  // ============================================
  describe('Mock payment failed', () => {
    it('should mark payment as failed', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.PENDING,
        gatewayResponse: { gatewayPaymentId: 'MOCK_GW_001-xxx' },
        order: {
          buyerId: 1,
          sellerId: 2,
        },
      };

      mockPrismaService.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.FAILED,
        failureReason: 'Card declined',
      });

      const result = await service.failMockPayment(1, 'Card declined', 1);

      expect(result.success).toBe(false);
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
            failureReason: 'Card declined',
          }),
        }),
      );
    });
  });

  // ============================================
  // RULE: Mock Payment Cancelled
  // ============================================
  describe('Mock payment cancelled', () => {
    it('should mark payment as cancelled', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.PENDING,
        order: {
          buyerId: 1,
          sellerId: 2,
        },
      };

      mockPrismaService.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.CANCELLED,
      });

      const result = await service.cancelMockPayment(1, 1);

      expect(result.success).toBe(false);
      expect(result.payment.status).toBe(PaymentStatus.CANCELLED);
    });
  });

  // ============================================
  // RULE: Duplicate callback prevention
  // ============================================
  describe('Duplicate callback prevention', () => {
    it('should handle duplicate callback gracefully (idempotent)', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.SUCCESS,
        order: {
          buyerId: 1,
          sellerId: 2,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);

      const result = await service.handleMockCallback(1, { status: 'SUCCESS' }, 1);

      // Should return success even though payment was already processed
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment already processed');
    });
  });

  // ============================================
  // RULE: Amount tampering detection
  // ============================================
  describe('Amount tampering detection', () => {
    it('should reject payment with tampered amount', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.PENDING,
        order: {
          buyerId: 1,
          sellerId: 2,
          finalAmount: 100000,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);
      mockGateway.createMockCallback.mockReturnValue({});

      // Change amount in order to simulate tampering
      payment.order.finalAmount = 99999;

      await expect(
        service.handleMockCallback(1, { status: 'SUCCESS' }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE: Verify payment for invalid payment
  // ============================================
  describe('Invalid payment verification', () => {
    it('should throw NotFoundException for non-existent payment', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.verifyPayment(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // RULE: Verify payment for another users payment
  // ============================================
  describe('Verify payment - unauthorized access', () => {
    it('should throw ForbiddenException when verifying others payment', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.COD,
        amount: 100000,
        status: PaymentStatus.SUCCESS,
        order: {
          buyerId: 1,
          sellerId: 2,
          finalAmount: 100000,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);

      // User 999 trying to verify payment for order owned by user 1
      await expect(service.verifyPayment(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE: Get payment - ownership check
  // ============================================
  describe('Get payment - ownership check', () => {
    it('should allow buyer to view their payment', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.COD,
        amount: 100000,
        status: PaymentStatus.SUCCESS,
        order: {
          buyerId: 1,
          sellerId: 2,
          finalAmount: 100000,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);

      const result = await service.getPaymentById(1, 1);

      expect(result.id).toBe(1);
    });

    it('should allow seller to view their payment', async () => {
      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.COD,
        amount: 100000,
        status: PaymentStatus.SUCCESS,
        order: {
          buyerId: 1,
          sellerId: 2,
          finalAmount: 100000,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);

      const result = await service.getPaymentById(1, 2);

      expect(result.id).toBe(1);
    });
  });

  // ============================================
  // RULE: Mock Gateway - Invalid transaction
  // ============================================
  describe('Mock Gateway - invalid transaction', () => {
    it('should reject invalid gateway payment ID', async () => {
      mockGateway.verifyTransaction.mockResolvedValue({
        valid: false,
        error: 'Invalid gateway payment ID',
      });

      const payment = {
        id: 1,
        orderId: 1,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 100000,
        status: PaymentStatus.SUCCESS,
        gatewayResponse: { gatewayPaymentId: 'INVALID_ID' },
        order: {
          buyerId: 1,
          sellerId: 2,
          finalAmount: 100000,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(payment);

      await expect(service.verifyPayment(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
