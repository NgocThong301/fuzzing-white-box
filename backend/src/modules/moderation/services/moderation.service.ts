import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { ListingService } from 'src/modules/listing/services/listing.service';
import { SearchModerationDto } from '../dto/moderation.dto';
import { ListingStatus, NotificationType } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly listingService: ListingService,
  ) {}

  async findPendingListings(query: SearchModerationDto) {
    return this.listingService.findAll(
      { ...query, status: ListingStatus.PENDING_REVIEW, approvedOnly: false },
      undefined,
      ['ADMIN', 'MODERATOR'],
    );
  }

  async approveListing(listingId: number, reviewerId: number) {
    return this.listingService.approve(listingId, reviewerId);
  }

  async rejectListing(listingId: number, reviewerId: number, rejectionReason: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Reject the listing
    const result = await this.listingService.reject(listingId, reviewerId, rejectionReason);

    // Create notification for seller
    await this.prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: NotificationType.LISTING_REJECTED,
        title: 'Listing bị từ chối',
        message: `Listing "${listing.id}" đã bị từ chối với lý do: ${rejectionReason}`,
        status: 'UNREAD',
      },
    });

    return result;
  }

  async getModerationStats() {
    const [pending, approved, rejected, hidden] = await Promise.all([
      this.prisma.listing.count({
        where: { status: ListingStatus.PENDING_REVIEW, deletedAt: null },
      }),
      this.prisma.listing.count({
        where: { status: ListingStatus.APPROVED, deletedAt: null },
      }),
      this.prisma.listing.count({
        where: { status: ListingStatus.REJECTED, deletedAt: null },
      }),
      this.prisma.listing.count({
        where: { status: ListingStatus.HIDDEN, deletedAt: null },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      hidden,
    };
  }
}
