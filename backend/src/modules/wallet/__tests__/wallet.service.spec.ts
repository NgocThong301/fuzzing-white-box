import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../services/wallet.service';
import { AuditLogService } from 'src/common/services/audit-log.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EscrowStatus, TransactionType } from '@prisma/client';

describe('WalletService - Escrow State Transitions', () => {
  let service: WalletService;

  const mockPrismaService = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    escrowTransaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
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
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RULE: Cannot release twice
  // ============================================
  describe('Rule: Cannot release escrow twice', () => {
    it('should reject release when already released', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
        buyerId: 1,
        sellerId: 2,
        amount: 100000,
        platformFee: 5000,
        seller: { wallet: { balance: 50000 } },
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(service.releaseEscrow(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should handle double release gracefully (idempotent)', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        releasedAt: new Date(),
        buyerId: 1,
        sellerId: 2,
        amount: 100000,
        platformFee: 5000,
        seller: { wallet: { id: 1, balance: 50000 } },
        orderId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      const result = await service.releaseEscrow(1, 1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Escrow already released');
    });
  });

  // ============================================
  // RULE: Cannot refund after release
  // ============================================
  describe('Rule: Cannot refund after release', () => {
    it('should reject dispute for released escrow', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
        buyerId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(
        service.disputeEscrow(1, 1, 'Product not received'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dispute for refunded escrow', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.REFUNDED,
        refundedAt: new Date(),
        buyerId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(
        service.disputeEscrow(1, 1, 'Product damaged'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE: Only buyer can dispute
  // ============================================
  describe('Rule: Only buyer can dispute escrow', () => {
    it('should reject dispute from non-buyer', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.FUNDED,
        buyerId: 1,
        sellerId: 2,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(
        service.disputeEscrow(1, 999, 'Fake reason'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow buyer to dispute', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        buyerId: 1,
        sellerId: 2,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);
      mockPrismaService.escrowTransaction.update.mockResolvedValue({
        ...escrow,
        status: EscrowStatus.DISPUTED,
        disputeReason: 'Product not received',
      });

      const result = await service.disputeEscrow(1, 1, 'Product not received');

      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // RULE: Only buyer/admin can release escrow
  // ============================================
  describe('Rule: Only buyer/admin can release escrow', () => {
    it('should reject release from seller', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        buyerId: 1,
        sellerId: 2,
        releasedAt: null,
        amount: 100000,
        platformFee: 5000,
        seller: { wallet: { id: 1, balance: 50000 } },
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(service.releaseEscrow(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE: Escrow amount must match order
  // ============================================
  describe('Rule: Escrow amount must match order', () => {
    it('should verify escrow amount matches order', async () => {
      const escrow = {
        id: 1,
        amount: 100000,
        order: {
          finalAmount: 100000,
        },
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      const result = await service.verifyEscrowAmount(1);

      expect(result).toBe(true);
    });

    it('should fail verification when amount mismatch', async () => {
      const escrow = {
        id: 1,
        amount: 90000,
        order: {
          finalAmount: 100000,
        },
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      const result = await service.verifyEscrowAmount(1);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // STATE TRANSITIONS: Happy Path
  // ============================================
  describe('State Transition: Happy Path', () => {
    it('should transition from FUNDED to HELD', async () => {
      const order = {
        id: 1,
        buyerId: 1,
        finalAmount: 100000,
        payments: [{ status: 'SUCCESS' }],
        items: [{ listing: { sellerId: 2 } }],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);
      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(null);
      mockPrismaService.escrowTransaction.create.mockResolvedValue({
        id: 1,
        status: EscrowStatus.FUNDED,
        amount: 100000,
      });

      const escrow = await service.createEscrow(1, 1);

      expect(escrow.status).toBe(EscrowStatus.FUNDED);
    });
  });

  // ============================================
  // STATE TRANSITIONS: Dispute Flow
  // ============================================
  describe('State Transition: Dispute Flow', () => {
    it('should transition from HELD to DISPUTED', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        buyerId: 1,
        sellerId: 2,
        releasedAt: null,
        refundedAt: null,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);
      mockPrismaService.escrowTransaction.update.mockResolvedValue({
        ...escrow,
        status: EscrowStatus.DISPUTED,
      });

      const result = await service.disputeEscrow(1, 1, 'Product damaged');

      expect(result.success).toBe(true);
      expect(result.escrow.status).toBe(EscrowStatus.DISPUTED);
    });

    it('should transition from DISPUTED to RELEASED (admin resolves for seller)', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.DISPUTED,
        amount: 100000,
        platformFee: 5000,
        buyerId: 1,
        sellerId: 2,
        releasedAt: null,
        refundedAt: null,
        seller: { wallet: { id: 1, balance: 50000 } },
        orderId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);
      mockPrismaService.escrowTransaction.update.mockResolvedValue({
        ...escrow,
        status: EscrowStatus.RELEASED,
      });
      mockPrismaService.wallet.update.mockResolvedValue({});
      mockPrismaService.walletTransaction.create.mockResolvedValue({});

      const result = await service.resolveDispute(1, 999, 'RELEASE', 'Evidence supports seller');

      expect(result.success).toBe(true);
      expect(result.resolution).toBe('RELEASED');
      expect(result.releasedAmount).toBe(95000);
    });

    it('should transition from DISPUTED to REFUNDED (admin resolves for buyer)', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.DISPUTED,
        amount: 100000,
        platformFee: 5000,
        buyerId: 1,
        sellerId: 2,
        releasedAt: null,
        refundedAt: null,
        seller: { wallet: { id: 1, balance: 50000 } },
        orderId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);
      mockPrismaService.escrowTransaction.update.mockResolvedValue({
        ...escrow,
        status: EscrowStatus.REFUNDED,
      });
      mockPrismaService.wallet.findUnique.mockResolvedValue({ id: 1, balance: 0 });
      mockPrismaService.wallet.update.mockResolvedValue({});
      mockPrismaService.walletTransaction.create.mockResolvedValue({});

      const result = await service.resolveDispute(1, 999, 'REFUND', 'Evidence supports buyer');

      expect(result.success).toBe(true);
      expect(result.resolution).toBe('REFUNDED');
      expect(result.refundedAmount).toBe(100000);
    });
  });

  // ============================================
  // RULE: Transaction must be idempotent
  // ============================================
  describe('Rule: Transaction idempotency', () => {
    it('should not create duplicate escrow for same order', async () => {
      const existingEscrow = {
        id: 1,
        orderId: 1,
        status: EscrowStatus.FUNDED,
        amount: 100000,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(existingEscrow);

      const result = await service.createEscrow(1, 1);

      expect(result.id).toBe(1);
      expect(mockPrismaService.escrowTransaction.create).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // RULE: Balance changes must have transaction
  // ============================================
  describe('Rule: Balance changes must have wallet transaction', () => {
    it('should create wallet transaction when releasing escrow', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        buyerId: 1,
        sellerId: 2,
        amount: 100000,
        platformFee: 5000,
        releasedAt: null,
        seller: { wallet: { id: 1, balance: 50000 } },
        orderId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);
      mockPrismaService.escrowTransaction.update.mockResolvedValue({
        ...escrow,
        status: EscrowStatus.RELEASED,
      });
      mockPrismaService.wallet.update.mockResolvedValue({});
      mockPrismaService.walletTransaction.create.mockResolvedValue({});

      await service.releaseEscrow(1, 1);

      expect(mockPrismaService.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: TransactionType.ESCROW_RELEASE,
            referenceType: 'ESCROW',
          }),
        }),
      );
    });
  });

  // ============================================
  // RULE: Unauthorized access
  // ============================================
  describe('Rule: Unauthorized access', () => {
    it('should reject access to escrow from non-participant', async () => {
      const escrow = {
        id: 1,
        buyerId: 1,
        sellerId: 2,
        order: {
          items: [],
          buyer: { id: 1 },
        },
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(service.getEscrowById(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE: Cannot resolve non-disputed escrow
  // ============================================
  describe('Rule: Cannot resolve non-disputed escrow', () => {
    it('should reject resolve for non-disputed escrow', async () => {
      const escrow = {
        id: 1,
        status: EscrowStatus.HELD,
        amount: 100000,
        platformFee: 5000,
        buyerId: 1,
        sellerId: 2,
        releasedAt: null,
        refundedAt: null,
        seller: { wallet: { id: 1, balance: 50000 } },
        orderId: 1,
      };

      mockPrismaService.escrowTransaction.findUnique.mockResolvedValue(escrow);

      await expect(
        service.resolveDispute(1, 999, 'RELEASE'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
