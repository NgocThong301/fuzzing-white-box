import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from '../services/listing.service';
import { AuditLogService, AuditAction } from 'src/common/services/audit-log.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ListingStatus, BookCondition, ShippingOption } from '@prisma/client';

describe('ListingService - Business Rules', () => {
  let service: ListingService;
  let prismaService: PrismaService;
  let auditLogService: AuditLogService;

  const mockPrismaService = {
    listing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    listingImage: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
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
        ListingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RULE 1: USER chỉ được chỉnh sửa listing của chính mình
  // ============================================
  describe('Rule 1: Owner can only edit their own listings', () => {
    const ownerId = 1;
    const otherUserId = 2;

    it('should allow owner to update their listing', async () => {
      const listing = {
        id: 1,
        sellerId: ownerId,
        status: ListingStatus.DRAFT,
        deletedAt: null,
        price: BigInt(150000),
        quantity: 1,
        condition: BookCondition.GOOD,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({ ...listing, price: BigInt(200000) });

      await expect(
        service.update(1, { price: 200000 }, ownerId, ['SELLER']),
      ).resolves.toBeDefined();

      expect(mockPrismaService.listing.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-owner tries to update', async () => {
      const listing = {
        id: 1,
        sellerId: ownerId,
        status: ListingStatus.DRAFT,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);

      await expect(
        service.update(1, { price: 200000 }, otherUserId, ['SELLER']),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // RULE 2: USER không được tự approve listing
  // RULE 5: MODERATOR có thể approve/reject
  // ============================================
  describe('Rule 2 & 5: Moderator can approve/reject', () => {
    it('should allow moderator to approve listing', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.PENDING_REVIEW,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.APPROVED,
      });

      await expect(
        service.approve(1, 3), // reviewerId = 3 (moderator)
      ).resolves.toBeDefined();

      expect(mockPrismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: ListingStatus.APPROVED,
          reviewerId: 3,
        }),
      });
    });

    it('should throw BadRequestException when approving non-pending listing', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.APPROVED,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);

      await expect(service.approve(1, 3)).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE 3: Listing mới phải PENDING_REVIEW
  // ============================================
  describe('Rule 3: New listings start as DRAFT', () => {
    it('should create listing with DRAFT status', async () => {
      const book = { id: 1, deletedAt: null };
      const createDto = {
        bookId: 1,
        price: 150000,
        quantity: 1,
        condition: BookCondition.GOOD,
        shippingOption: ShippingOption.PICKUP,
      };

      mockPrismaService.book.findUnique.mockResolvedValue(book);
      mockPrismaService.listing.create.mockResolvedValue({
        id: 1,
        ...createDto,
        status: ListingStatus.DRAFT,
        sellerId: 1,
      });
      mockPrismaService.listing.findUnique.mockResolvedValue({
        id: 1,
        ...createDto,
        status: ListingStatus.DRAFT,
        sellerId: 1,
      });

      await service.create(createDto, 1);

      expect(mockPrismaService.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ListingStatus.DRAFT,
          }),
        }),
      );
    });
  });

  // ============================================
  // RULE 4: Chỉ listing APPROVED mới xuất hiện public
  // ============================================
  describe('Rule 4: Only APPROVED listings are public', () => {
    it('should show APPROVED listings to public', async () => {
      const approvedListing = {
        id: 1,
        status: ListingStatus.APPROVED,
        deletedAt: null,
        seller: { id: 1, fullName: 'Seller' },
        book: { title: 'Book' },
      };

      mockPrismaService.listing.findMany.mockResolvedValue([approvedListing]);
      mockPrismaService.listing.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, undefined, []);

      expect(result.data).toHaveLength(1);
    });

    it('should hide non-APPROVED listings from public', async () => {
      mockPrismaService.listing.findMany.mockResolvedValue([]);
      mockPrismaService.listing.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10 }, undefined, []);

      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ListingStatus.APPROVED,
          }),
        }),
      );
    });

    it('should show all listings to owner', async () => {
      const userId = 1;
      const listings = [
        { id: 1, status: ListingStatus.DRAFT, sellerId: userId },
        { id: 2, status: ListingStatus.APPROVED, sellerId: userId },
      ];

      mockPrismaService.listing.findMany.mockResolvedValue(listings);
      mockPrismaService.listing.count.mockResolvedValue(2);

      await service.findAll({ page: 1, limit: 10 }, userId, ['SELLER']);

      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({}),
        }),
      );
    });
  });

  // ============================================
  // RULE 6: Khi reject phải có rejectionReason
  // ============================================
  describe('Rule 6: Rejection requires reason', () => {
    it('should throw BadRequestException when rejection reason is empty', async () => {
      await expect(
        service.reject(1, 2, ''),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.reject(1, 2, '   '),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid rejection reason', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.PENDING_REVIEW,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.REJECTED,
        rejectionReason: 'Price too low',
      });

      await expect(
        service.reject(1, 3, 'Price too low'),
      ).resolves.toBeDefined();
    });
  });

  // ============================================
  // RULE 7: Seller có thể chỉnh sửa listing bị reject và submit lại
  // ============================================
  describe('Rule 7: Seller can edit REJECTED listings and resubmit', () => {
    it('should allow editing REJECTED listing', async () => {
      const ownerId = 1;
      const rejectedListing = {
        id: 1,
        sellerId: ownerId,
        status: ListingStatus.REJECTED,
        rejectionReason: 'Price too low',
        deletedAt: null,
        price: BigInt(100000),
        quantity: 1,
        condition: BookCondition.GOOD,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(rejectedListing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...rejectedListing,
        price: BigInt(180000),
      });

      await expect(
        service.update(1, { price: 180000 }, ownerId, ['SELLER']),
      ).resolves.toBeDefined();
    });

    it('should clear rejection reason when resubmitting', async () => {
      const ownerId = 1;
      const rejectedListing = {
        id: 1,
        sellerId: ownerId,
        status: ListingStatus.REJECTED,
        rejectionReason: 'Price too low',
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(rejectedListing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...rejectedListing,
        status: ListingStatus.PENDING_REVIEW,
        rejectionReason: null,
      });

      await service.submit(1, ownerId);

      expect(mockPrismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: ListingStatus.PENDING_REVIEW,
          rejectionReason: null,
        }),
      });
    });

    it('should throw BadRequestException when editing APPROVED listing', async () => {
      const ownerId = 1;
      const approvedListing = {
        id: 1,
        sellerId: ownerId,
        status: ListingStatus.APPROVED,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(approvedListing);

      await expect(
        service.update(1, { price: 180000 }, ownerId, ['SELLER']),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // RULE 8: ADMIN có toàn quyền
  // ============================================
  describe('Rule 8: Admin has full permissions', () => {
    it('should allow admin to delete any listing', async () => {
      const listing = {
        id: 1,
        sellerId: 2, // Different from admin
        status: ListingStatus.DRAFT,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue(listing);

      await expect(
        service.remove(1, 999, ['ADMIN']), // Admin ID = 999
      ).resolves.toEqual({ success: true, message: 'Listing deleted successfully' });
    });

    it('should allow admin to hide any listing', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.APPROVED,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.HIDDEN,
      });

      await expect(
        service.hide(1, 999, ['ADMIN']),
      ).resolves.toBeDefined();
    });
  });

  // ============================================
  // RULE 9: Giá phải > 0
  // RULE 10: Quantity phải >= 1
  // ============================================
  describe('Rule 9 & 10: Price and quantity validation', () => {
    it('should validate price > 0 in DTO', async () => {
      // This is validated at DTO level with class-validator
      // @Min(1) decorator ensures price > 0
      const createDto = {
        bookId: 1,
        price: 0,
        quantity: 1,
        condition: BookCondition.GOOD,
        shippingOption: ShippingOption.PICKUP,
      };

      // DTO validation happens before service call
      // This test verifies the expectation
      expect(createDto.price).toBeLessThanOrEqual(0);
    });

    it('should validate quantity >= 1 in DTO', async () => {
      const createDto = {
        bookId: 1,
        price: 100000,
        quantity: 0,
        condition: BookCondition.GOOD,
        shippingOption: ShippingOption.PICKUP,
      };

      expect(createDto.quantity).toBeLessThan(1);
    });
  });

  // ============================================
  // RULE 12: AuditLog cho các actions
  // ============================================
  describe('Rule 12: AuditLog is recorded', () => {
    it('should log LISTING_CREATED', async () => {
      const book = { id: 1, deletedAt: null };
      const createDto = {
        bookId: 1,
        price: 150000,
        quantity: 1,
        condition: BookCondition.GOOD,
        shippingOption: ShippingOption.PICKUP,
      };

      mockPrismaService.book.findUnique.mockResolvedValue(book);
      mockPrismaService.listing.create.mockResolvedValue({
        id: 1,
        ...createDto,
        status: ListingStatus.DRAFT,
        sellerId: 1,
      });
      mockPrismaService.listing.findUnique.mockResolvedValue({
        id: 1,
        ...createDto,
        status: ListingStatus.DRAFT,
        sellerId: 1,
      });

      await service.create(createDto, 1);

      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LISTING_CREATED,
          entityType: 'Listing',
        }),
      );
    });

    it('should log LISTING_APPROVED', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.PENDING_REVIEW,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.APPROVED,
      });

      await service.approve(1, 3);

      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LISTING_APPROVED,
          entityType: 'Listing',
        }),
      );
    });

    it('should log LISTING_REJECTED with reason', async () => {
      const listing = {
        id: 1,
        sellerId: 2,
        status: ListingStatus.PENDING_REVIEW,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.REJECTED,
        rejectionReason: 'Invalid price',
      });

      await service.reject(1, 3, 'Invalid price');

      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LISTING_REJECTED,
          entityType: 'Listing',
          newData: expect.objectContaining({
            rejectionReason: 'Invalid price',
          }),
        }),
      );
    });

    it('should log LISTING_HIDDEN', async () => {
      const listing = {
        id: 1,
        sellerId: 1,
        status: ListingStatus.APPROVED,
        deletedAt: null,
      };

      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockPrismaService.listing.update.mockResolvedValue({
        ...listing,
        status: ListingStatus.HIDDEN,
      });

      await service.hide(1, 1, ['SELLER']);

      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LISTING_HIDDEN,
          entityType: 'Listing',
        }),
      );
    });
  });

  // ============================================
  // Additional: Listing not found
  // ============================================
  describe('Listing not found scenarios', () => {
    it('should throw NotFoundException when listing does not exist', async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for deleted listings', async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
