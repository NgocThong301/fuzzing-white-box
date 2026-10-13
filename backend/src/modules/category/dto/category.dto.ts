import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Khoa học Máy tính', description: 'Tên danh mục' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Sách về lập trình, thuật toán, AI...', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục cha (nếu có)' })
  @IsOptional()
  @IsInt()
  parentId?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục cha (để di chuyển danh mục)' })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
