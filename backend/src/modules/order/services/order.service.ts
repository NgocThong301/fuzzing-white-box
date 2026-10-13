import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';
import { OrderStatus, ListingStatus, NotificationType, NotificationStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  private readonly PLATFORM_FEE_PERCENT = 5; // 5% platform fee
  private readonly SHIPPING_FEE = 30000; // 30,000 VND

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    // 1. Get user's cart
    const cart = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            book: true,
            seller: true,
          },
        },
      },
    });

    if (cart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Validate all items (stock, price, availability)
    const validationResults = await this.validateCartItems(cart);
    if (!validationResults.valid) {
      throw new BadRequestException(validationResults.reason || 'Some items in cart are no longer available');
    }

    // 3. Calculate totals from DB (Rule: Backend tự tính lại total)
    const { subtotal, discount, coupon } = await this.calculateTotals(cart, dto.couponCode, userId);
    const shippingFee = this.SHIPPING_FEE;
    const finalAmount = subtotal - discount + shippingFee;

    // 4. Generate order number
    const orderNumber = await this.generateOrderNumber();

    // 5. Group items by seller for separate orders
    const itemsBySeller = this.groupItemsBySeller(cart);

    // 6. Determine payment method and initial status
    const paymentMethod = dto.paymentMethod || PaymentMethod.COD;
    const needsPayment = paymentMethod === PaymentMethod.BANKING || paymentMethod === PaymentMethod.VNPAY_SANDBOX;
    const initialStatus = needsPayment ? OrderStatus.PENDING_PAYMENT : OrderStatus.CONFIRMED;

    // 7. Create orders for each seller
    const orders = await Promise.all(
      itemsBySeller.map(async (sellerItems) => {
        const sellerSubtotal = sellerItems.reduce(
          (sum, item) => sum + Number(item.listing.price) * item.quantity,
          0,
        );
        const sellerShippingFee = Math.ceil(this.SHIPPING_FEE / itemsBySeller.length) || this.SHIPPING_FEE;
        const sellerFinalAmount = sellerSubtotal + sellerShippingFee;

        const order = await this.prisma.order.create({
          data: {
            orderNumber: `${orderNumber}-${sellerItems[0].listing.sellerId}`,
            buyerId: userId,
            sellerId: sellerItems[0].listing.sellerId,
            totalAmount: sellerSubtotal,
            shippingFee: sellerShippingFee,
            discountAmount: 0,
            finalAmount: sellerFinalAmount,
            status: initialStatus,
            shippingAddress: dto.shippingAddress,
            shippingPhone: dto.shippingPhone,
            shippingName: dto.shippingName,
            notes: dto.notes,
            couponId: coupon?.id,
            items: {
              create: sellerItems.map((item) => ({
                listingId: item.listingId,
                quantity: item.quantity,
                unitPrice: item.listing.price,
                subtotal: Number(item.listing.price) * item.quantity,
              })),
            },
          },
          include: {
            items: true,
            buyer: true,
            seller: true,
          },
        });

        // For COD/WALLET, auto-create payment record (sandbox mode)
        if (!needsPayment) {
          await this.prisma.payment.create({
            data: {
              orderId: order.id,
              method: paymentMethod,
              amount: sellerFinalAmount,
              status: PaymentStatus.SUCCESS,
              transactionId: `SANDBOX_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
              gatewayResponse: { sandbox: true, message: 'Auto-confirmed for COD/WALLET in sandbox mode' },
            },
          });
        }

        return order;
      }),
    );

    // 7. Reduce inventory (hold stock)
    await this.holdInventory(cart);

    // 8. Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId } });

    // 9. Create notifications
    await this.createOrderNotifications(orders, userId);

    // 10. Log audit
    await this.auditLog.log({
      userId,
      action: AuditAction.ORDER_CREATED,
      entityType: 'Order',
      entityId: orders.map((o) => o.id.toString()).join(','),
      newData: {
        orderNumbers: orders.map((o) => o.orderNumber),
        totalAmount: orders.reduce((sum, o) => sum + Number(o.finalAmount), 0),
      },
    });

    return {
      orders,
      summary: {
        subtotal,
        discount,
        shippingFee,
        totalAmount: orders.reduce((sum, o) => sum + Number(o.finalAmount), 0),
      },
    };
  }

  async getMyOrders(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  book: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          buyer: {
            select: { id: true, fullName: true, email: true },
          },
          seller: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { buyerId: userId } }),
    ]);

    return {
      data: orders,
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

  async getSellerOrders(sellerId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { sellerId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  book: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          buyer: {
            select: { id: true, fullName: true, email: true },
          },
          seller: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { sellerId } }),
    ]);

    return {
      data: orders,
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

  async getOrderById(orderId: number, userId: number, userRoles: string[]) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                book: true,
                seller: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        buyer: {
          select: { id: true, fullName: true, email: true },
        },
        seller: {
          select: { id: true, fullName: true, email: true },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Rule 6, 7, 8, 9: Permission check
    const isAdmin = userRoles.includes('ADMIN');
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto, userId: number, userRoles: string[]) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Permission check
    const isAdmin = userRoles.includes('ADMIN');
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to update this order');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, dto.status, isAdmin, isBuyer, isSeller);

    const updateData: any = { status: dto.status };

    if (dto.status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = dto.reason;
    }

    if (dto.status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        buyer: true,
        seller: true,
      },
    });

    // If cancelled, restore inventory
    if (dto.status === OrderStatus.CANCELLED) {
      await this.restoreInventory(updatedOrder.items);
    }

    // Log audit
    await this.auditLog.log({
      userId,
      action: AuditAction.ORDER_STATUS_CHANGED,
      entityType: 'Order',
      entityId: orderId.toString(),
      oldData: { status: order.status },
      newData: { status: dto.status, reason: dto.reason },
    });

    return updatedOrder;
  }

  async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        include: {
          items: {
            include: {
              listing: {
                include: {
                  book: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          buyer: {
            select: { id: true, fullName: true, email: true },
          },
          seller: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
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

  // Private helper methods
  private async validateCartItems(cart: any[]) {
    for (const item of cart) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: item.listingId },
        include: { book: true },
      });

      const itemName = listing?.book?.title || `ID: ${item.listingId}`;

      if (!listing) {
        return { valid: false, reason: `Sản phẩm "${itemName}" không tồn tại` };
      }

      if (listing.deletedAt) {
        return { valid: false, reason: `Sản phẩm "${itemName}" đã bị xóa` };
      }

      if (listing.status !== ListingStatus.APPROVED) {
        return { valid: false, reason: `Sản phẩm "${itemName}" không còn khả dụng (status: ${listing.status})` };
      }

      if (listing.quantity < item.quantity) {
        if (listing.quantity === 0) {
          return { valid: false, reason: `Sản phẩm "${itemName}" đã hết hàng` };
        }
        return { valid: false, reason: `Sản phẩm "${itemName}" chỉ còn ${listing.quantity} cuốn trong kho` };
      }
    }

    return { valid: true };
  }

  private async calculateTotals(cart: any[], couponCode?: string, userId?: number) {
    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.listing.price) * item.quantity,
      0,
    );

    let discount = 0;
    let coupon = null;

    if (couponCode) {
      const validCoupon = await this.validateCoupon(couponCode, subtotal, userId);
      if (validCoupon) {
        coupon = validCoupon.coupon;
        discount = validCoupon.discount;
      }
    }

    return { subtotal, discount, coupon };
  }

  private async validateCoupon(code: string, orderTotal: number, userId?: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon?.isActive) {
      return null;
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return null;
    }

    if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
      return null;
    }

    if (coupon.minOrderAmount && orderTotal < Number(coupon.minOrderAmount)) {
      return null;
    }

    // Check usage limit
    const usageCount = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id },
    });

    if (coupon.usageLimit && usageCount >= coupon.usageLimit) {
      return null;
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return { coupon, discount };
  }

  private async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${year}${month}-${random}`;
  }

  private groupItemsBySeller(cart: any[]) {
    const grouped = new Map<number, any[]>();

    for (const item of cart) {
      const sellerId = item.listing.sellerId;
      if (!grouped.has(sellerId)) {
        grouped.set(sellerId, []);
      }
      grouped.get(sellerId)!.push(item);
    }

    return Array.from(grouped.values());
  }

  private async holdInventory(cart: any[]) {
    for (const item of cart) {
      await this.prisma.listing.update({
        where: { id: item.listingId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }
  }

  private async restoreInventory(items: any[]) {
    for (const item of items) {
      await this.prisma.listing.update({
        where: { id: item.listingId },
        data: {
          quantity: { increment: item.quantity },
        },
      });
    }
  }

  private async createOrderNotifications(orders: any[], buyerId: number) {
    const notifications = [];

    // Notify buyer
    notifications.push({
      userId: buyerId,
      type: NotificationType.ORDER_CREATED,
      title: 'Đặt hàng thành công',
      message: `Bạn đã đặt ${orders.length} đơn hàng thành công`,
      status: NotificationStatus.UNREAD,
    });

    // Notify sellers
    for (const order of orders) {
      if (order.sellerId) {
        notifications.push({
          userId: order.sellerId,
          type: NotificationType.ORDER_CREATED,
          title: 'Có đơn hàng mới',
          message: `Bạn có đơn hàng mới #${order.orderNumber}`,
          status: NotificationStatus.UNREAD,
        });
      }
    }

    await this.prisma.notification.createMany({ data: notifications });
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    isAdmin: boolean,
    isBuyer: boolean,
    isSeller: boolean,
  ) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.SHIPPING],
      SHIPPING: [OrderStatus.DELIVERED],
      DELIVERED: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
      COMPLETED: [],
      CANCELLED: [],
      DISPUTED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    };

    if (!isAdmin && !validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Only seller can confirm orders
    if (newStatus === OrderStatus.CONFIRMED && !isSeller && !isAdmin) {
      throw new ForbiddenException('Only seller can confirm orders');
    }

    // Only buyer can cancel or complete
    if (newStatus === OrderStatus.CANCELLED && !isBuyer && !isAdmin) {
      throw new ForbiddenException('Only buyer can cancel orders');
    }

    if (newStatus === OrderStatus.COMPLETED && !isBuyer && !isAdmin) {
      throw new ForbiddenException('Only buyer can complete orders');
    }
  }
}
