/**
 * WALLET SERVICE
 * ==============
 * 
 * Xử lý các nghiệp vụ liên quan đến ví MÔ PHỎNG
 * 
 * ⚠️  LƯU Ý QUAN TRỌNG:
 * - Đây là VÍ MÔ PHỎNG dành cho mục đích học tập
 * - KHÔNG có tiền thật trong ví này
 * - KHÔNG kết nối với ngân hàng thật
 * - Tất cả số dư và giao dịch đều là MOCK
 */

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { EscrowStatus, TransactionType } from '@prisma/client';

export interface WalletBalance {
  balance: number;
  pendingEscrow: number;
  availableBalance: number;
}

export interface WalletTransactionItem {
  id: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
}

@Injectable()
export class WalletService {
  private readonly PLATFORM_FEE_PERCENT = 5; // 5% platform fee

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Lấy thông tin ví của user
   */
  async getWallet(userId: number) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Tạo ví mới nếu chưa có
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      });
    }

    // Calculate pending escrow
    const pendingEscrow = await this.calculatePendingEscrow(userId);

    return {
      id: wallet.id,
      balance: Number(wallet.balance),
      pendingEscrow,
      availableBalance: Number(wallet.balance) - pendingEscrow,
      currency: wallet.currency,
      isActive: wallet.isActive,
    };
  }

  /**
   * Lấy lịch sử giao dịch của ví
   */
  async getTransactions(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Verify wallet exists
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      data: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Lấy escrow transactions của user (là seller)
   */
  async getEscrowTransactions(userId: number, status?: EscrowStatus) {
    const where: any = { sellerId: userId };
    if (status) {
      where.status = status;
    }

    const escrows = await this.prisma.escrowTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            buyer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return escrows.map((e) => ({
      ...e,
      amount: Number(e.amount),
      platformFee: Number(e.platformFee),
      netAmount: Number(e.amount) - Number(e.platformFee),
    }));
  }

  /**
   * Lấy chi tiết một escrow transaction
   */
  async getEscrowById(escrowId: number, userId: number) {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        order: {
          include: {
            items: {
              include: {
                listing: {
                  include: {
                    book: true,
                  },
                },
              },
            },
            buyer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        seller: {
          select: { id: true, fullName: true, email: true },
        },
        buyer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    // Verify user có quyền xem
    const isAdmin = false; // Check từ user roles
    const isBuyer = escrow.buyerId === userId;
    const isSeller = escrow.sellerId === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to view this escrow');
    }

    return {
      ...escrow,
      amount: Number(escrow.amount),
      platformFee: Number(escrow.platformFee),
      netAmount: Number(escrow.amount) - Number(escrow.platformFee),
    };
  }

  /**
   * Tạo escrow mới khi payment thành công
   * Được gọi từ PaymentService sau khi payment SUCCESS
   */
  async createEscrow(orderId: number, userId: number): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        items: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify payment đã thành công
    const successfulPayment = order.payments.find(
      (p) => p.status === 'SUCCESS'
    );

    if (!successfulPayment) {
      throw new BadRequestException('No successful payment found for this order');
    }

    // Check xem đã có escrow chưa (idempotent)
    const existingEscrow = await this.prisma.escrowTransaction.findUnique({
      where: { orderId },
    });

    if (existingEscrow) {
      return existingEscrow;
    }

    // Tính platform fee
    const platformFee = Math.round(
      Number(order.finalAmount) * (this.PLATFORM_FEE_PERCENT / 100)
    );

    // Lấy seller từ order items đầu tiên (tất cả items cùng seller)
    const sellerId = order.items[0]?.listing?.sellerId;

    if (!sellerId) {
      throw new BadRequestException('No seller found for this order');
    }

    // Tạo escrow
    const escrow = await this.prisma.escrowTransaction.create({
      data: {
        orderId,
        sellerId,
        buyerId: order.buyerId,
        amount: order.finalAmount,
        platformFee,
        status: EscrowStatus.FUNDED,
        fundedAt: new Date(),
      },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.ESCROW_CREATED,
      entityType: 'EscrowTransaction',
      entityId: escrow.id.toString(),
      newData: {
        orderId,
        amount: Number(escrow.amount),
        platformFee,
      },
    });

    return escrow;
  }

  /**
   * Giải phóng escrow cho seller (khi buyer xác nhận đã nhận hàng)
   */
  async releaseEscrow(escrowId: number, userId: number): Promise<any> {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        seller: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    // Verify user là buyer hoặc admin
    const isBuyer = escrow.buyerId === userId;
    const isAdmin = false; // Check từ user roles

    if (!isBuyer && !isAdmin) {
      throw new ForbiddenException('Only buyer or admin can release escrow');
    }

    // Verify escrow status
    if (escrow.status !== EscrowStatus.HELD) {
      throw new BadRequestException(
        `Cannot release escrow in status ${escrow.status}. Only HELD status can be released.`
      );
    }

    // Prevent double release (idempotent)
    if (escrow.releasedAt) {
      return {
        success: true,
        message: 'Escrow already released',
        escrow,
      };
    }

    // Tính số tiền net cho seller
    const netAmount = Number(escrow.amount) - Number(escrow.platformFee);

    // Update escrow status
    const updatedEscrow = await this.prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Update seller wallet
    const sellerWallet = escrow.seller.wallet;
    if (!sellerWallet) {
      throw new NotFoundException('Seller wallet not found');
    }
    const newBalance = Number(sellerWallet.balance) + netAmount;

    await this.prisma.wallet.update({
      where: { id: sellerWallet.id },
      data: { balance: newBalance },
    });

    // Tạo transaction record (bắt buộc)
    await this.prisma.walletTransaction.create({
      data: {
        walletId: sellerWallet.id,
        userId: escrow.sellerId,
        type: TransactionType.ESCROW_RELEASE,
        amount: netAmount,
        balanceBefore: Number(sellerWallet.balance),
        balanceAfter: newBalance,
        description: `Escrow release for order #${escrow.orderId}`,
        referenceId: escrowId.toString(),
        referenceType: 'ESCROW',
      },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.ESCROW_RELEASED,
      entityType: 'EscrowTransaction',
      entityId: escrowId.toString(),
      newData: {
        amount: Number(escrow.amount),
        netAmount,
        releasedTo: escrow.sellerId,
      },
    });

    return {
      success: true,
      escrow: updatedEscrow,
      releasedAmount: netAmount,
      newBalance,
    };
  }

  /**
   * Dispute escrow (buyer khiếu nại)
   */
  async disputeEscrow(
    escrowId: number,
    userId: number,
    reason: string
  ): Promise<any> {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    // Verify user là buyer
    if (escrow.buyerId !== userId) {
      throw new ForbiddenException('Only buyer can dispute this escrow');
    }

    // Verify escrow status
    if (escrow.status === EscrowStatus.RELEASED || escrow.status === EscrowStatus.REFUNDED) {
      throw new BadRequestException(
        `Cannot dispute escrow in status ${escrow.status}`
      );
    }

    // Update escrow status
    const updatedEscrow = await this.prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.DISPUTED,
        disputeReason: reason,
      },
    });

    // Audit log
    await this.auditLog.log({
      userId,
      action: AuditAction.ESCROW_DISPUTED,
      entityType: 'EscrowTransaction',
      entityId: escrowId.toString(),
      newData: {
        reason,
      },
    });

    return {
      success: true,
      escrow: updatedEscrow,
    };
  }

  /**
   * Resolve dispute (Admin xử lý khiếu nại)
   */
  async resolveDispute(
    escrowId: number,
    adminId: number,
    resolution: 'RELEASE' | 'REFUND',
    note?: string
  ): Promise<any> {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        seller: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    if (escrow.status !== EscrowStatus.DISPUTED) {
      throw new BadRequestException('Only disputed escrows can be resolved');
    }

    // Verify đã không bị release hoặc refund trước đó
    if (escrow.releasedAt || escrow.refundedAt) {
      throw new BadRequestException('Escrow has already been resolved');
    }

    if (resolution === 'RELEASE') {
      // Release cho seller
      const netAmount = Number(escrow.amount) - Number(escrow.platformFee);
      const sellerWallet = escrow.seller?.wallet;
      if (!sellerWallet) {
        throw new NotFoundException('Seller wallet not found');
      }
      const newBalance = Number(sellerWallet.balance) + netAmount;

      await this.prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date(),
          resolvedBy: adminId,
          resolvedAt: new Date(),
          resolutionNote: note,
        },
      });

      await this.prisma.wallet.update({
        where: { id: sellerWallet.id },
        data: { balance: newBalance },
      });

      await this.prisma.walletTransaction.create({
        data: {
          walletId: sellerWallet.id,
          userId: escrow.sellerId,
          type: TransactionType.ESCROW_RELEASE,
          amount: netAmount,
          balanceBefore: Number(sellerWallet.balance),
          balanceAfter: newBalance,
          description: `Escrow release (dispute resolved) for order #${escrow.orderId}`,
          referenceId: escrowId.toString(),
          referenceType: 'ESCROW',
        },
      });

      // Audit log
      await this.auditLog.log({
        userId: adminId,
        action: AuditAction.ESCROW_RESOLVED_RELEASE,
        entityType: 'EscrowTransaction',
        entityId: escrowId.toString(),
        newData: {
          resolution: 'RELEASE',
          note,
          releasedTo: escrow.sellerId,
        },
      });

      return {
        success: true,
        resolution: 'RELEASED',
        releasedAmount: netAmount,
      };

    } else {
      // Refund cho buyer
      // Lấy buyer wallet
      const buyerWallet = await this.prisma.wallet.findUnique({
        where: { userId: escrow.buyerId },
      });

      if (!buyerWallet) {
        throw new NotFoundException('Buyer wallet not found');
      }

      const newBalance = Number(buyerWallet.balance) + Number(escrow.amount);

      await this.prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: EscrowStatus.REFUNDED,
          refundedAt: new Date(),
          resolvedBy: adminId,
          resolvedAt: new Date(),
          resolutionNote: note,
        },
      });

      await this.prisma.wallet.update({
        where: { id: buyerWallet.id },
        data: { balance: newBalance },
      });

      await this.prisma.walletTransaction.create({
        data: {
          walletId: buyerWallet.id,
          userId: escrow.buyerId,
          type: TransactionType.REFUND,
          amount: Number(escrow.amount),
          balanceBefore: Number(buyerWallet.balance),
          balanceAfter: newBalance,
          description: `Escrow refund (dispute resolved) for order #${escrow.orderId}`,
          referenceId: escrowId.toString(),
          referenceType: 'ESCROW',
        },
      });

      // Audit log
      await this.auditLog.log({
        userId: adminId,
        action: AuditAction.ESCROW_RESOLVED_REFUND,
        entityType: 'EscrowTransaction',
        entityId: escrowId.toString(),
        newData: {
          resolution: 'REFUND',
          note,
          refundedTo: escrow.buyerId,
        },
      });

      return {
        success: true,
        resolution: 'REFUNDED',
        refundedAmount: Number(escrow.amount),
      };
    }
  }

  /**
   * Lấy tất cả disputed escrows (Admin)
   */
  async getDisputedEscrows() {
    return this.prisma.escrowTransaction.findMany({
      where: { status: EscrowStatus.DISPUTED },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            buyer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        seller: {
          select: { id: true, fullName: true, email: true },
        },
        buyer: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tính tổng escrow đang chờ xử lý của một user (seller)
   */
  private async calculatePendingEscrow(userId: number): Promise<number> {
    const result = await this.prisma.escrowTransaction.aggregate({
      where: {
        sellerId: userId,
        status: {
          in: [EscrowStatus.FUNDED, EscrowStatus.HELD, EscrowStatus.DISPUTED],
        },
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }

  /**
   * Verify escrow amount khớp với order (internal check)
   */
  async verifyEscrowAmount(escrowId: number): Promise<boolean> {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        order: true,
      },
    });

    if (!escrow || !escrow.order) {
      return false;
    }

    const orderAmount = Number(escrow.order.finalAmount);
    const escrowAmount = Number(escrow.amount);

    return orderAmount === escrowAmount;
  }
}
