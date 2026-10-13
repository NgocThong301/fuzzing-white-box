import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    // Check for duplicate name
    const existing = await this.prisma.category.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    // Check parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(args: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: number | null;
    rootOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, parentId, rootOnly, sortBy = 'name', sortOrder = 'asc' } = args;

    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (rootOnly) {
      where.parentId = null;
    } else if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: true,
          children: {
            orderBy: { name: 'asc' },
          },
          _count: {
            select: { books: true },
          },
        },
      }),
      this.prisma.category.count({ where }),
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

  async findTree() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            children: {
              orderBy: { name: 'asc' },
              include: {
                _count: {
                  select: { books: true },
                },
              },
            },
            _count: {
              select: { books: true },
            },
          },
        },
        _count: {
          select: { books: true },
        },
      },
    });

    return categories;
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { books: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for circular reference
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if new parent exists
      const newParent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!newParent) {
        throw new NotFoundException('Parent category not found');
      }

      // Check if new parent is a descendant of current category
      const isDescendant = await this.checkDescendant(dto.parentId, id);
      if (isDescendant) {
        throw new BadRequestException('Cannot set a descendant as parent (circular reference)');
      }
    }

    // Check for duplicate name if updating name
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  private async checkDescendant(parentId: number, ancestorId: number): Promise<boolean> {
    const children = await this.prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === ancestorId) {
        return true;
      }
      if (await this.checkDescendant(child.id, ancestorId)) {
        return true;
      }
    }

    return false;
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { books: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with child categories');
    }

    if (category._count.books > 0) {
      throw new ConflictException('Cannot delete category with existing books');
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
