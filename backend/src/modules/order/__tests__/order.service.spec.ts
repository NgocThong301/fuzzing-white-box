import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../services/order.service';
import { AuditLogService } from 'src/common/services/audit-log.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderStatus, ListingStatus } from '@prisma/client';

describe('OrderService - Business Rules', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    listing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
    couponUsage: {
      count: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockAuditLogService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RULE 1: Không thể đặt quantity lớn hơn tồn kho
  // ============================================
  describe('Rule 1: Cannot order more than available stock', () => {
    it('should reject order when quantity exceeds stock', async () => {
      const cartItem = {
        listingId: 1,
        quantity: 10,
        listing: {
          id: 1,
          quantity: 5, // Only 5 in stock
          status: ListingStatus.APPROVED,
          deletedAt: null,
          price: BigInt(100000),
        },
      };

      mockPrismaService.cartItem.findMany.mockResolvedValue([cartItem]);
      mockPrismaService.listing.findUnique.mockResolvedValue({
        id: 1,
        quantity: 5,
        status: ListingStatus.APPROVED,
        deletedAt: null,
        price: BigInt(100000),
      });

      await expect(
        service.createOrder(1, {
          shippingAddress: '123 Test St',
          shippingPhone: '0909123456',
          shippingName: 'Test User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE 2 & 4: Backend tự tính lại total
  // ============================================
  describe('Rule 2 & 4: Backend recalculates totals', () => {
    it('should recalculate total from database prices', async () => {
      const cartItems = [
        {
          listingId: 1,
          quantity: 2,
          listing: {
            id: 1,
            quantity: 10,
            status: ListingStatus.APPROVED,
            deletedAt: null,
            price: BigInt(150000),
            seller: { id: 2, fullName: 'Seller' },
            book: { title: 'Book 1' },
          },
        },
      ];

      mockPrismaService.cartItem.findMany.mockResolvedValue(cartItems);
      mockPrismaService.listing.findUnique.mockResolvedValue({
        ...cartItems[0].listing,
      });
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      mockPrismaService.order.create.mockResolvedValue({
        id: 1,
        orderNumber: 'ORD-20240101-0001',
        finalAmount: BigInt(330000), // 150000 * 2 + 30000 shipping
      });
      mockPrismaService.notification.createMany.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.createOrder(1, {
        shippingAddress: '123 Test St',
        shippingPhone: '0909123456',
        shippingName: 'Test User',
      });

      expect(mockPrismaService.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 300000, // 150000 * 2
            shippingFee: expect.any(Number),
          }),
        }),
      );
    });
  });

  // ============================================
  // RULE 6: Không cho user sửa order của user khác
  // ============================================
  describe('Rule 6: Cannot modify other users orders', () => {
    it('should throw ForbiddenException when non-owner tries to update', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.updateOrderStatus(
          1,
          { status: OrderStatus.CANCELLED },
          999, // Different user
          ['USER'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE 7: Seller chỉ xem order liên quan đến mình
  // ============================================
  describe('Rule 7: Seller can only view their orders', () => {
    it('should allow seller to view their order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
        items: [],
        buyer: { id: 1, fullName: 'Buyer', email: 'buyer@test.com' },
        seller: { id: 2, fullName: 'Seller', email: 'seller@test.com' },
        payments: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      const result = await service.getOrderById(1, 2, ['SELLER']);

      expect(result).toEqual(order);
    });

    it('should throw ForbiddenException when seller tries to view others order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.getOrderById(1, 3, ['SELLER']), // Seller 3 trying to view Seller 2's order
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE 8: Buyer chỉ xem order của mình
  // ============================================
  describe('Rule 8: Buyer can only view their orders', () => {
    it('should allow buyer to view their order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
        items: [],
        buyer: { id: 1, fullName: 'Buyer', email: 'buyer@test.com' },
        seller: { id: 2, fullName: 'Seller', email: 'seller@test.com' },
        payments: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      const result = await service.getOrderById(1, 1, ['BUYER']);

      expect(result).toEqual(order);
    });

    it('should throw ForbiddenException when buyer tries to view others order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      await expect(
        service.getOrderById(1, 999, ['BUYER']),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE 9: Admin xem tất cả
  // ============================================
  describe('Rule 9: Admin can view all orders', () => {
    it('should allow admin to view any order', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
        items: [],
        buyer: { id: 1, fullName: 'Buyer', email: 'buyer@test.com' },
        seller: { id: 2, fullName: 'Seller', email: 'seller@test.com' },
        payments: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      const result = await service.getOrderById(1, 999, ['ADMIN']);

      expect(result).toEqual(order);
    });
  });

  // ============================================
  // Additional: Empty cart
  // ============================================
  describe('Empty cart handling', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      mockPrismaService.cartItem.findMany.mockResolvedValue([]);

      await expect(
        service.createOrder(1, {
          shippingAddress: '123 Test St',
          shippingPhone: '0909123456',
          shippingName: 'Test User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // Additional: Order not found
  // ============================================
  describe('Order not found', () => {
    it('should throw NotFoundException when order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrderById(999, 1, ['USER']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // Additional: Invalid status transition
  // ============================================
  describe('Status transitions', () => {
    it('should validate status transitions for non-admin users', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      // Cannot go from PENDING_PAYMENT to DELIVERED directly for non-admin
      await expect(
        service.updateOrderStatus(
          1,
          { status: OrderStatus.DELIVERED },
          2,
          ['SELLER'],
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // Additional: Inventory hold on order creation
  // ============================================
  describe('Inventory management', () => {
    it('should reduce inventory when order is created', async () => {
      const cartItems = [
        {
          listingId: 1,
          quantity: 2,
          listing: {
            id: 1,
            quantity: 10,
            status: ListingStatus.APPROVED,
            deletedAt: null,
            price: BigInt(100000),
            seller: { id: 2, fullName: 'Seller' },
            book: { title: 'Book 1' },
          },
        },
      ];

      mockPrismaService.cartItem.findMany.mockResolvedValue(cartItems);
      mockPrismaService.listing.findUnique.mockResolvedValue({
        ...cartItems[0].listing,
      });
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      mockPrismaService.order.create.mockResolvedValue({
        id: 1,
        orderNumber: 'ORD-20240101-0001',
        finalAmount: BigInt(230000),
      });
      mockPrismaService.notification.createMany.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockPrismaService.listing.update.mockResolvedValue({});

      await service.createOrder(1, {
        shippingAddress: '123 Test St',
        shippingPhone: '0909123456',
        shippingName: 'Test User',
      });

      expect(mockPrismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: { decrement: 2 } },
      });
    });

    it('should restore inventory when order is cancelled', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        status: OrderStatus.PENDING_PAYMENT,
        items: [
          { listingId: 1, quantity: 2 },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.CANCELLED,
      });
      mockPrismaService.listing.update.mockResolvedValue({});

      await service.updateOrderStatus(
        1,
        { status: OrderStatus.CANCELLED, reason: 'Customer cancelled' },
        1,
        ['BUYER'],
      );

      expect(mockPrismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: { increment: 2 } },
      });
    });
  });
});
