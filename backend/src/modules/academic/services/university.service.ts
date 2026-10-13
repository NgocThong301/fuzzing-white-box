import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUniversityDto, UpdateUniversityDto } from '../dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UniversityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUniversityDto) {
    // Check for duplicate name
    const existing = await this.prisma.university.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('University with this name already exists');
    }

    return this.prisma.university.create({
      data: dto,
    });
  }

  async findAll(args: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = args;

    const where: Prisma.UniversityWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { majors: true, users: true },
          },
        },
      }),
      this.prisma.university.count({ where }),
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
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: {
        majors: {
          include: {
            _count: { select: { courses: true, books: true } },
          },
        },
        _count: { select: { users: true } },
      },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    return university;
  }

  async update(id: number, dto: UpdateUniversityDto) {
    const university = await this.prisma.university.findUnique({ where: { id } });
    if (!university) {
      throw new NotFoundException('University not found');
    }

    // Check for duplicate name if updating name
    if (dto.name && dto.name !== university.name) {
      const existing = await this.prisma.university.findFirst({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('University with this name already exists');
      }
    }

    return this.prisma.university.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: { _count: { select: { users: true, majors: true } } },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    if (university._count.users > 0 || university._count.majors > 0) {
      throw new ConflictException('Cannot delete university with existing users or majors');
    }

    return this.prisma.university.delete({ where: { id } });
  }
}
