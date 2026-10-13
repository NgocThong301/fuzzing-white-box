import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCondition } from '@prisma/client';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code', description: 'Tên sách' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({ example: '978-0132350884', description: 'ISBN' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin', description: 'Tác giả' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({ example: 'Prentice Hall', description: 'Nhà xuất bản' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  publisher?: string;

  @ApiPropertyOptional({ example: '1st Edition', description: 'Phiên bản' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  edition?: string;

  @ApiPropertyOptional({ example: 2008, description: 'Năm xuất bản' })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  publicationYear?: number;

  @ApiPropertyOptional({ example: 'A handbook of agile software craftsmanship...', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg', description: 'URL ảnh bìa' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiProperty({ enum: BookCondition, description: 'Tình trạng sách' })
  @IsEnum(BookCondition)
  condition: BookCondition;

  @ApiPropertyOptional({ example: 1, description: 'ID ngành học' })
  @IsOptional()
  @IsInt()
  majorId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID học phần' })
  @IsOptional()
  @IsInt()
  courseId?: number;
}

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  publisher?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  edition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  publicationYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional({ enum: BookCondition })
  @IsOptional()
  @IsEnum(BookCondition)
  condition?: BookCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  majorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  courseId?: number;
}
