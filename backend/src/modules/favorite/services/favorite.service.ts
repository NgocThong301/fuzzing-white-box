/**
 * FAVORITE SERVICE
 * ================
 * 
 * Xử lý yêu thích listing
 */

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Thêm listing vào favorites
   */
  async addFavorite(userId: number, listingId: number) {
    // Check listing exists
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, listingId },
    });

    if (existing) {
      throw new ConflictException('Listing already in favorites');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: {
          include: {
            book: true,
            seller: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
        },
      },
    });
  }

  /**
   * Xóa khỏi favorites
   */
  async removeFavorite(userId: number, listingId: number) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, listingId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  /**
   * Lấy danh sách favorites của user
   */
  async getFavorites(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              book: {
                include: {
                  category: true,
                },
              },
              seller: {
                select: { id: true, fullName: true, avatar: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      data: favorites.map((f) => ({
        id: f.id,
        listing: f.listing,
        addedAt: f.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Kiểm tra listing có trong favorites không
   */
  async isFavorited(userId: number, listingId: number): Promise<boolean> {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, listingId },
    });
    return !!favorite;
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(userId: number, listingId: number) {
    const isFav = await this.isFavorited(userId, listingId);

    if (isFav) {
      await this.removeFavorite(userId, listingId);
      return { favorited: false };
    } else {
      await this.addFavorite(userId, listingId);
      return { favorited: true };
    }
  }
}
