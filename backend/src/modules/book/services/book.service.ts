import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateBookDto, UpdateBookDto, SearchBookDto } from '../dto';
import { Prisma } from '@prisma/client';
import { BookCondition } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    // Check ISBN uniqueness if provided
    if (dto.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: dto.isbn },
      });
      if (existing) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Validate references
    if (dto.majorId) {
      const major = await this.prisma.major.findUnique({ where: { id: dto.majorId } });
      if (!major) {
        throw new NotFoundException('Major not found');
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    return this.prisma.book.create({
      data: dto,
      include: {
        major: {
          include: { university: true },
        },
        category: true,
        course: {
          include: { major: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
      },
    });
  }

  async findAll(query: SearchBookDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
      isbn,
      title,
      author,
      publisher,
      universityId,
      majorId,
      courseId,
      categoryId,
      condition,
      publicationYear,
    } = query;

    const where: Prisma.BookWhereInput = {
      deletedAt: null,
    };

    // Full-text search across multiple fields
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { isbn: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { publisher: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Specific field searches
    if (isbn) {
      where.isbn = { contains: isbn, mode: 'insensitive' };
    }
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    if (publisher) {
      where.publisher = { contains: publisher, mode: 'insensitive' };
    }
    if (condition) {
      where.condition = condition;
    }
    if (publicationYear) {
      where.publicationYear = publicationYear;
    }

    // Relations filters
    if (universityId) {
      where.major = { universityId };
    }
    if (majorId) {
      where.majorId = majorId;
    }
    if (courseId) {
      where.courseId = courseId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Map sortBy to valid fields
    const validSortFields = ['createdAt', 'title', 'author', 'publisher', 'publicationYear'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          major: {
            include: { university: true },
          },
          category: true,
          course: {
            include: { major: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { listings: true, favorites: true },
          },
        },
      }),
      this.prisma.book.count({ where }),
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
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        major: {
          include: { university: true },
        },
        category: true,
        course: {
          include: { major: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
        _count: {
          select: { listings: true, favorites: true },
        },
      },
    });

    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    // Check ISBN uniqueness if updating
    if (dto.isbn && dto.isbn !== book.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: dto.isbn },
      });
      if (existing) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Validate references
    if (dto.majorId) {
      const major = await this.prisma.major.findUnique({ where: { id: dto.majorId } });
      if (!major) {
        throw new NotFoundException('Major not found');
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
      include: {
        major: {
          include: { university: true },
        },
        category: true,
        course: {
          include: { major: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
      },
    });
  }

  async remove(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        _count: { select: { listings: true, favorites: true } },
      },
    });

    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    // Soft delete to preserve references
    return this.prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats() {
    const [total, byCondition, byUniversity] = await Promise.all([
      this.prisma.book.count({ where: { deletedAt: null } }),
      this.prisma.book.groupBy({
        by: ['condition'],
        where: { deletedAt: null },
        _count: true,
      }),
      this.prisma.book.groupBy({
        by: ['majorId'],
        where: { deletedAt: null, majorId: { not: null } },
        _count: true,
      }),
    ]);

    // Get university names for the byUniversity stats
    const majorIds = byUniversity.map((b: { majorId: number | null }) => b.majorId).filter((id): id is number => id !== null);
    const majors = await this.prisma.major.findMany({
      where: { id: { in: majorIds } },
      include: { university: true },
    });

    const majorMap = new Map(majors.map((m) => [m.id, m]));

    return {
      total,
      byCondition: byCondition.map((b: { condition: string | null; _count: number }) => ({
        condition: b.condition,
        count: b._count,
      })),
      byUniversity: byUniversity.map((b: { majorId: number | null; _count: number }) => ({
        university: b.majorId ? majorMap.get(b.majorId)?.university.name : 'Unknown',
        count: b._count,
      })),
    };
  }
}
