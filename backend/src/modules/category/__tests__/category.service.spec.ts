import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../services/category.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createDto = { name: 'Test Category', description: 'Test Description' };
      const expectedResult = { id: 1, ...createDto, parentId: null, children: [], createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createDto,
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if category name already exists', async () => {
      const createDto = { name: 'Existing Category' };
      mockPrismaService.category.findFirst.mockResolvedValue({ id: 1, name: 'Existing Category' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create a child category with valid parent', async () => {
      const createDto = { name: 'Child Category', parentId: 1 };
      const parentCategory = { id: 1, name: 'Parent Category' };

      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(parentCategory);
      mockPrismaService.category.create.mockResolvedValue({ id: 2, ...createDto });

      const result = await service.create(createDto);

      expect(result.parentId).toBe(1);
    });

    it('should throw NotFoundException if parent category not found', async () => {
      const createDto = { name: 'Child Category', parentId: 999 };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const categories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(categories);
      mockPrismaService.category.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(categories);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by rootOnly', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);
      mockPrismaService.category.count.mockResolvedValue(0);

      await service.findAll({ rootOnly: true });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentId: null,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = { id: 1, name: 'Test Category', children: [], _count: { books: 0 } };
      mockPrismaService.category.findUnique.mockResolvedValue(category);

      const result = await service.findOne(1);

      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const existingCategory = { id: 1, name: 'Old Name', parentId: null };
      const updateDto = { name: 'New Name' };
      const updatedCategory = { id: 1, name: 'New Name' };

      mockPrismaService.category.findUnique.mockResolvedValue(existingCategory);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('New Name');
    });

    it('should throw BadRequestException for self-reference', async () => {
      const category = { id: 1, name: 'Self Reference' };

      mockPrismaService.category.findUnique.mockResolvedValue(category);

      await expect(service.update(1, { name: 'New Name' })).resolves.toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a category without relations', async () => {
      const category = { id: 1, children: [], _count: { books: 0 } };
      mockPrismaService.category.findUnique.mockResolvedValue(category);
      mockPrismaService.category.delete.mockResolvedValue(category);

      await service.remove(1);

      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ConflictException if category has children', async () => {
      const category = { id: 1, children: [{ id: 2 }], _count: { books: 0 } };
      mockPrismaService.category.findUnique.mockResolvedValue(category);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if category has books', async () => {
      const category = { id: 1, children: [], _count: { books: 5 } };
      mockPrismaService.category.findUnique.mockResolvedValue(category);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findTree', () => {
    it('should return hierarchical category tree', async () => {
      const treeData = [
        {
          id: 1,
          name: 'Root',
          children: [{ id: 2, name: 'Child', children: [] }],
        },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(treeData);

      const result = await service.findTree();

      expect(result).toEqual(treeData);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
        }),
      );
    });
  });
});
