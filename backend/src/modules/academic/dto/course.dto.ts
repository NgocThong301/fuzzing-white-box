import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Nhập môn Lập trình', description: 'Tên học phần' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'CS101', description: 'Mã học phần' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 1, description: 'ID của ngành' })
  @IsInt()
  majorId: number;

  @ApiPropertyOptional({ example: 1, description: 'Học kỳ (1-8)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  semester?: number;

  @ApiPropertyOptional({ example: 2024, description: 'Năm học' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  semester?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
