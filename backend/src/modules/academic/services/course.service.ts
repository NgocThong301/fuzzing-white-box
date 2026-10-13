import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    // Check if major exists
    const major = await this.prisma.major.findUnique({
      where: { id: dto.majorId },
    });
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    // Check for duplicate code within major
    const existing = await this.prisma.course.findFirst({
      where: { majorId: dto.majorId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Course with this code already exists in this major');
    }

    return this.prisma.course.create({
      data: dto,
      include: {
        major: {
          include: { university: true },
        },
      },
    });
  }

  async findAll(args: {
    page?: number;
    limit?: number;
    search?: string;
    majorId?: number;
    universityId?: number;
    semester?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, majorId, universityId, semester, sortBy = 'createdAt', sortOrder = 'desc' } = args;

    const where: Prisma.CourseWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (majorId) {
      where.majorId = majorId;
    }
    if (universityId) {
      where.major = { universityId };
    }
    if (semester) {
      where.semester = semester;
    }

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          major: {
            include: { university: true },
          },
          _count: {
            select: { books: true, listings: true },
          },
        },
      }),
      this.prisma.course.count({ where }),
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
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        major: {
          include: { university: true },
        },
        _count: {
          select: { books: true, listings: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for duplicate code if updating code
    if (dto.code && dto.code !== course.code) {
      const existing = await this.prisma.course.findFirst({
        where: { majorId: course.majorId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException('Course with this code already exists in this major');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        major: {
          include: { university: true },
        },
      },
    });
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { books: true, listings: true } } },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course._count.books > 0 || course._count.listings > 0) {
      throw new ConflictException('Cannot delete course with existing books or listings');
    }

    return this.prisma.course.delete({ where: { id } });
  }

  async findByMajor(majorId: number, args: {
    page?: number;
    limit?: number;
    search?: string;
    semester?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, semester, sortBy = 'createdAt', sortOrder = 'desc' } = args;

    const where: Prisma.CourseWhereInput = { majorId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (semester) {
      where.semester = semester;
    }

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { books: true, listings: true },
          },
        },
      }),
      this.prisma.course.count({ where }),
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
