import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BookCondition } from '@prisma/client';

export class SearchBookDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên, ISBN, tác giả, nhà xuất bản' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo ISBN' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên sách' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tác giả' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo nhà xuất bản' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trường đại học' })
  @IsOptional()
  @IsInt()
  universityId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ngành học' })
  @IsOptional()
  @IsInt()
  majorId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo học phần' })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ enum: BookCondition, description: 'Lọc theo tình trạng' })
  @IsOptional()
  @IsEnum(BookCondition)
  condition?: BookCondition;

  @ApiPropertyOptional({ example: 2020, description: 'Lọc theo năm xuất bản' })
  @IsOptional()
  @IsInt()
  publicationYear?: number;

  @ApiPropertyOptional({ description: 'Giá từ', type: Number })
  @IsOptional()
  @IsInt()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá đến', type: Number })
  @IsOptional()
  @IsInt()
  maxPrice?: number;
}
