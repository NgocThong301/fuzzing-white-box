import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateMajorDto, UpdateMajorDto } from '../dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MajorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMajorDto) {
    // Check if university exists
    const university = await this.prisma.university.findUnique({
      where: { id: dto.universityId },
    });
    if (!university) {
      throw new NotFoundException('University not found');
    }

    // Check for duplicate code within university
    const existing = await this.prisma.major.findFirst({
      where: { universityId: dto.universityId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Major with this code already exists in this university');
    }

    return this.prisma.major.create({
      data: dto,
      include: {
        university: true,
      },
    });
  }

  async findAll(args: {
    page?: number;
    limit?: number;
    search?: string;
    universityId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, universityId, sortBy = 'createdAt', sortOrder = 'desc' } = args;

    const where: Prisma.MajorWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (universityId) {
      where.universityId = universityId;
    }

    const [data, total] = await Promise.all([
      this.prisma.major.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          university: true,
          _count: {
            select: { courses: true, books: true },
          },
        },
      }),
      this.prisma.major.count({ where }),
    ]);

    return {
      data,
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

  async findOne(id: number) {
    const major = await this.prisma.major.findUnique({
      where: { id },
      include: {
        university: true,
        courses: {
          orderBy: { code: 'asc' },
        },
        _count: {
          select: { books: true },
        },
      },
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    return major;
  }

  async update(id: number, dto: UpdateMajorDto) {
    const major = await this.prisma.major.findUnique({ where: { id } });
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    // Check for duplicate code if updating code
    if (dto.code && dto.code !== major.code) {
      const existing = await this.prisma.major.findFirst({
        where: { universityId: major.universityId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException('Major with this code already exists in this university');
      }
    }

    return this.prisma.major.update({
      where: { id },
      data: dto,
      include: {
        university: true,
      },
    });
  }

  async remove(id: number) {
    const major = await this.prisma.major.findUnique({
      where: { id },
      include: { _count: { select: { courses: true, books: true } } },
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    if (major._count.courses > 0 || major._count.books > 0) {
      throw new ConflictException('Cannot delete major with existing courses or books');
    }

    return this.prisma.major.delete({ where: { id } });
  }

  async findByUniversity(universityId: number, args: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = args;

    const where: Prisma.MajorWhereInput = { universityId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.major.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { courses: true, books: true },
          },
        },
      }),
      this.prisma.major.count({ where }),
    ]);

    return {
      data,
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
}
