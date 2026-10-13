import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getCart(userId: number) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            book: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out invalid items (deleted, not approved)
    const validItems = cartItems.filter(
      (item) => !item.listing.deletedAt && item.listing.status === ListingStatus.APPROVED,
    );

    // Remove invalid items from cart
    const invalidItems = cartItems.filter(
      (item) => item.listing.deletedAt || item.listing.status !== ListingStatus.APPROVED,
    );

    if (invalidItems.length > 0) {
      await this.prisma.cartItem.deleteMany({
        where: {
          id: { in: invalidItems.map((item) => item.id) },
        },
      });
    }

    // Calculate subtotal
    const subtotal = validItems.reduce((sum, item) => {
      return sum + Number(item.listing.price) * item.quantity;
    }, 0);

    return {
      items: validItems.map((item) => ({
        id: item.id,
        listingId: item.listingId,
        quantity: item.quantity,
        listing: item.listing,
        price: Number(item.listing.price),
        subtotal: Number(item.listing.price) * item.quantity,
      })),
      subtotal,
      itemCount: validItems.length,
    };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const { listingId, quantity = 1 } = dto;

    // Check if listing exists and is approved
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing || listing.deletedAt) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== ListingStatus.APPROVED) {
      throw new BadRequestException('Listing is not available for purchase');
    }

    // Rule: Seller cannot buy their own listing
    if (listing.sellerId === userId) {
      throw new ForbiddenException('You cannot buy your own listing');
    }

    // Check stock
    if (listing.quantity < quantity) {
      throw new BadRequestException(`Only ${listing.quantity} items available in stock`);
    }

    // Check if already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > listing.quantity) {
        throw new BadRequestException(`Cannot exceed available stock of ${listing.quantity}`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          listing: {
            include: {
              book: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      });
    }

    // Add new item
    return this.prisma.cartItem.create({
      data: {
        userId,
        listingId,
        quantity,
      },
      include: {
        listing: {
          include: {
            book: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  async updateCartItem(userId: number, listingId: number, dto: UpdateCartItemDto) {
    const { quantity } = dto;

    // Check if item exists in cart
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      include: { listing: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    // Check stock
    if (quantity > cartItem.listing.quantity) {
      throw new BadRequestException(`Only ${cartItem.listing.quantity} items available in stock`);
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, listingId);
    }

    return this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: {
        listing: {
          include: {
            book: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  async removeFromCart(userId: number, listingId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return { success: true, message: 'Item removed from cart' };
  }

  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { success: true, message: 'Cart cleared' };
  }

  async validateCart(userId: number) {
    const cart = await this.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate each item
    const validationResults = await Promise.all(
      cart.items.map(async (item) => {
        const listing = await this.prisma.listing.findUnique({
          where: { id: item.listingId },
        });

        if (!listing || listing.deletedAt) {
          return {
            listingId: item.listingId,
            valid: false,
            reason: 'Listing no longer exists',
          };
        }

        if (listing.status !== ListingStatus.APPROVED) {
          return {
            listingId: item.listingId,
            valid: false,
            reason: 'Listing is no longer available',
          };
        }

        if (listing.quantity < item.quantity) {
          return {
            listingId: item.listingId,
            valid: false,
            reason: `Only ${listing.quantity} items available`,
            availableQuantity: listing.quantity,
          };
        }

        // Check price change
        if (Number(listing.price) !== Number(item.price)) {
          return {
            listingId: item.listingId,
            valid: true,
            priceChanged: true,
            oldPrice: Number(item.price),
            newPrice: Number(listing.price),
          };
        }

        return {
          listingId: item.listingId,
          valid: true,
        };
      }),
    );

    const hasIssues = validationResults.some((r) => !r.valid || r.priceChanged);

    return {
      valid: !validationResults.some((r) => !r.valid),
      items: validationResults,
      hasIssues,
      cart: hasIssues ? await this.getCart(userId) : cart,
    };
  }
}
