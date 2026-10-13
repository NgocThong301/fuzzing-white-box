import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from '../services/book.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookCondition } from '@prisma/client';

describe('BookService', () => {
  let service: BookService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    book: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      groupBy: jest.fn(),
    },
    major: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookDto = {
      title: 'Test Book',
      isbn: '978-0132350884',
      author: 'Test Author',
      publisher: 'Test Publisher',
      condition: BookCondition.GOOD,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a book successfully', async () => {
      const expectedResult = { id: 1, ...createBookDto, createdAt: new Date(), updatedAt: new Date() };
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue(expectedResult);

      const result = await service.create(createBookDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.book.create).toHaveBeenCalledWith({
        data: createBookDto,
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if ISBN already exists', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue({ id: 1, isbn: '978-0132350884' });

      await expect(service.create(createBookDto)).rejects.toThrow(ConflictException);
    });

    it('should validate major exists', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.major.findUnique.mockResolvedValue(null);

      const dtoWithMajor = { ...createBookDto, majorId: 999 };

      await expect(service.create(dtoWithMajor)).rejects.toThrow(NotFoundException);
    });

    it('should validate category exists', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.major.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      const dtoWithCategory = { ...createBookDto, majorId: 1, categoryId: 999 };

      await expect(service.create(dtoWithCategory)).rejects.toThrow(NotFoundException);
    });

    it('should validate course exists', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.major.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.category.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      const dtoWithCourse = { ...createBookDto, majorId: 1, categoryId: 1, courseId: 999 };

      await expect(service.create(dtoWithCourse)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const books = [
        { id: 1, title: 'Book 1' },
        { id: 2, title: 'Book 2' },
      ];
      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.book.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(books);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by search query', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      await service.findAll({ q: 'algorithms' });

      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should filter by condition', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      await service.findAll({ condition: BookCondition.NEW });

      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            condition: BookCondition.NEW,
          }),
        }),
      );
    });

    it('should filter by university', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.book.count.mockResolvedValue(0);

      await service.findAll({ universityId: 1 });

      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            major: { universityId: 1 },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const book = { id: 1, title: 'Test Book', deletedAt: null };
      mockPrismaService.book.findUnique.mockResolvedValue(book);

      const result = await service.findOne(1);

      expect(result).toEqual(book);
    });

    it('should throw NotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if book is soft deleted', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const existingBook = { id: 1, title: 'Old Title', isbn: '978-0000000000' };
      const updateDto = { title: 'New Title' };
      const updatedBook = { id: 1, title: 'New Title' };

      mockPrismaService.book.findUnique.mockResolvedValue(existingBook);
      mockPrismaService.book.update.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateDto);

      expect(result.title).toBe('New Title');
    });

    it('should throw NotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a book', async () => {
      const book = { id: 1, _count: { listings: 0, favorites: 0 }, deletedAt: null };
      mockPrismaService.book.findUnique.mockResolvedValue(book);
      mockPrismaService.book.update.mockResolvedValue({ ...book, deletedAt: new Date() });

      await service.remove(1);

      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
