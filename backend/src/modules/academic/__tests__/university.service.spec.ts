import { Test, TestingModule } from '@nestjs/testing';
import { UniversityService } from '../services/university.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UniversityService', () => {
  let service: UniversityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    university: {
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
        UniversityService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UniversityService>(UniversityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a university successfully', async () => {
      const createDto = {
        name: 'Test University',
        shortName: 'TU',
        address: '123 Test St',
      };
      const expectedResult = { id: 1, ...createDto, createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.university.findFirst.mockResolvedValue(null);
      mockPrismaService.university.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.university.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw ConflictException if university name already exists', async () => {
      const createDto = { name: 'Existing University' };
      mockPrismaService.university.findFirst.mockResolvedValue({ id: 1, name: 'Existing University' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated universities', async () => {
      const universities = [
        { id: 1, name: 'University 1' },
        { id: 2, name: 'University 2' },
      ];
      mockPrismaService.university.findMany.mockResolvedValue(universities);
      mockPrismaService.university.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(universities);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter universities by search term', async () => {
      mockPrismaService.university.findMany.mockResolvedValue([]);
      mockPrismaService.university.count.mockResolvedValue(0);

      await service.findAll({ search: 'test' });

      expect(mockPrismaService.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a university by id', async () => {
      const university = { id: 1, name: 'Test University', majors: [], _count: { users: 0 } };
      mockPrismaService.university.findUnique.mockResolvedValue(university);

      const result = await service.findOne(1);

      expect(result).toEqual(university);
    });

    it('should throw NotFoundException if university not found', async () => {
      mockPrismaService.university.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a university', async () => {
      const existingUniversity = { id: 1, name: 'Old Name' };
      const updateDto = { name: 'New Name' };
      const updatedUniversity = { id: 1, name: 'New Name' };

      mockPrismaService.university.findUnique.mockResolvedValue(existingUniversity);
      mockPrismaService.university.findFirst.mockResolvedValue(null);
      mockPrismaService.university.update.mockResolvedValue(updatedUniversity);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should delete a university without relations', async () => {
      const university = { id: 1, _count: { users: 0, majors: 0 } };
      mockPrismaService.university.findUnique.mockResolvedValue(university);
      mockPrismaService.university.delete.mockResolvedValue(university);

      await service.remove(1);

      expect(mockPrismaService.university.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ConflictException if university has users', async () => {
      const university = { id: 1, _count: { users: 1, majors: 0 } };
      mockPrismaService.university.findUnique.mockResolvedValue(university);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if university has majors', async () => {
      const university = { id: 1, _count: { users: 0, majors: 5 } };
      mockPrismaService.university.findUnique.mockResolvedValue(university);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
