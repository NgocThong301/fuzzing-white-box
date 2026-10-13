/**
 * RECOMMENDATION SERVICE
 * ======================
 * 
 * Rule-based recommendation system cho textbook marketplace
 * 
 * ⚠️  ĐÂY LÀ RULE-BASED RECOMMENDATION
 * Không sử dụng machine learning
 * Scoring system đơn giản
 * 
 * Scoring:
 * - course match = +5 điểm
 * - category match = +3 điểm
 * - favorite category = +2 điểm
 * - popular (nhiều view) = +1 điểm
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

export interface RecommendationScore {
  listingId: number;
  score: number;
  reasons: string[];
}

export interface RecommendationResult {
  listings: RecommendationScore[];
  explanation: string;
}

@Injectable()
export class RecommendationService {
  // Trọng số cho scoring
  private readonly WEIGHTS = {
    COURSE_MATCH: 5,
    CATEGORY_MATCH: 3,
    FAVORITE_CATEGORY: 2,
    POPULAR: 1,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId: number, limit = 10): Promise<RecommendationResult> {
    // Lấy user preferences từ favorites
    const userFavorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            book: {
              include: {
                category: true,
                course: true,
              },
            },
          },
        },
      },
    });

    // Lấy user purchase history (orders completed)
    const userOrders = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            listing: {
              include: {
                book: {
                  include: {
                    category: true,
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract categories và courses từ favorites và purchases
    const favoriteCategoryIds = new Set<number>();
    const favoriteCourseIds = new Set<number>();

    userFavorites.forEach((fav) => {
      if (fav.listing?.book?.categoryId) {
        favoriteCategoryIds.add(fav.listing.book.categoryId);
      }
      if (fav.listing?.book?.courseId) {
        favoriteCourseIds.add(fav.listing.book.courseId);
      }
    });

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.listing?.book?.categoryId) {
          favoriteCategoryIds.add(item.listing.book.categoryId);
        }
        if (item.listing?.book?.courseId) {
          favoriteCourseIds.add(item.listing.book.courseId);
        }
      });
    });

    // Lấy listings đã xem (từ audit log)
    const viewedListings = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: 'LISTING_VIEWED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const viewedListingIds = new Set(viewedListings.map((v) => parseInt(v.entityId || '0')));

    // Lấy tất cả approved listings
    const allListings = await this.prisma.listing.findMany({
      where: {
        status: 'APPROVED',
        quantity: { gt: 0 },
      },
      include: {
        book: {
          include: {
            category: true,
            course: true,
          },
        },
        seller: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Lấy view count cho popular scoring
    const viewCounts = await this.prisma.auditLog.groupBy({
      by: ['entityId'],
      where: {
        action: 'LISTING_VIEWED',
        entityType: 'Listing',
      },
      _count: true,
    });

    const viewCountMap = new Map(
      viewCounts.map((v) => [parseInt(v.entityId || '0'), v._count]),
    );

    // Calculate scores
    const scoredListings: RecommendationScore[] = [];

    for (const listing of allListings) {
      // Skip user's own listings
      // Skip already viewed (optional - can include for "browse again")
      
      let score = 0;
      const reasons: string[] = [];

      // Course match
      if (listing.book?.courseId && favoriteCourseIds.has(listing.book.courseId)) {
        score += this.WEIGHTS.COURSE_MATCH;
        reasons.push(`Khớp với khóa học bạn quan tâm`);
      }

      // Category match
      if (listing.book?.categoryId && favoriteCategoryIds.has(listing.book.categoryId)) {
        score += this.WEIGHTS.CATEGORY_MATCH;
        reasons.push(`Thuộc danh mục bạn yêu thích`);
      }

      // Popular (dựa trên view count)
      const viewCount = viewCountMap.get(listing.id) || 0;
      if (viewCount > 10) {
        score += this.WEIGHTS.POPULAR;
        reasons.push(`Đang được quan tâm nhiều`);
      }

      // Nếu user chưa có history, recommend popular items
      if (favoriteCategoryIds.size === 0 && favoriteCourseIds.size === 0) {
        score = viewCount > 0 ? viewCount : 1;
        reasons.push(`Sách phổ biến`);
      }

      if (score > 0) {
        scoredListings.push({
          listingId: listing.id,
          score,
          reasons,
        });
      }
    }

    // Sort by score và lấy top N
    scoredListings.sort((a, b) => b.score - a.score);
    const topListings = scoredListings.slice(0, limit);

    // Get full listing data for top results
    const listingIds = topListings.map((l) => l.listingId);
    const listingsData = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
      include: {
        book: {
          include: {
            category: true,
            course: true,
          },
        },
        seller: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Merge score data with listing data
    const result = topListings.map((scored) => ({
      ...listingsData.find((l) => l.id === scored.listingId),
      score: scored.score,
      reasons: scored.reasons,
    }));

    return {
      listings: result as any,
      explanation: this.getExplanation(favoriteCategoryIds.size, favoriteCourseIds.size),
    };
  }

  /**
   * Get similar listings
   */
  async getSimilarListings(listingId: number, limit = 5): Promise<any[]> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        book: {
          include: {
            category: true,
            course: true,
          },
        },
      },
    });

    if (!listing) {
      return [];
    }

    const similar = await this.prisma.listing.findMany({
      where: {
        status: 'APPROVED',
        id: { not: listingId },
        quantity: { gt: 0 },
        OR: [
          { book: { categoryId: listing.book?.categoryId } },
          { book: { courseId: listing.book?.courseId } },
        ],
      },
      include: {
        book: {
          include: {
            category: true,
            course: true,
          },
        },
        seller: {
          select: { id: true, fullName: true },
        },
      },
      take: limit,
    });

    return similar;
  }

  /**
   * Get trending/popular listings
   */
  async getTrending(limit = 10): Promise<any[]> {
    // Get most viewed in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const viewCounts = await this.prisma.auditLog.groupBy({
      by: ['entityId'],
      where: {
        action: 'LISTING_VIEWED',
        entityType: 'Listing',
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
      orderBy: { _count: { entityId: 'desc' } },
      take: limit,
    });

    const listingIds = viewCounts.map((v) => parseInt(v.entityId || '0'));

    if (listingIds.length === 0) {
      // Fallback: just get recent approved listings
      return this.prisma.listing.findMany({
        where: { status: 'APPROVED', quantity: { gt: 0 } },
        include: {
          book: { include: { category: true } },
          seller: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    return this.prisma.listing.findMany({
      where: { id: { in: listingIds }, status: 'APPROVED', quantity: { gt: 0 } },
      include: {
        book: { include: { category: true } },
        seller: { select: { id: true, fullName: true } },
      },
    });
  }

  private getExplanation(categoryCount: number, courseCount: number): string {
    if (categoryCount === 0 && courseCount === 0) {
      return 'Dựa trên các sách phổ biến trên thị trường';
    }
    return 'Dựa trên sở thích và lịch sử của bạn (danh mục, khóa học đã quan tâm)';
  }
}
