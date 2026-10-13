import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchCategoryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo danh mục cha' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: true, description: 'Chỉ lấy danh mục gốc' })
  @IsOptional()
  @IsBoolean()
  rootOnly?: boolean;
}

export class GetCategoryTreeDto extends PaginationDto {
  @ApiPropertyOptional({ example: true, description: 'Chỉ lấy danh mục gốc (không có cha)' })
  @IsOptional()
  @IsBoolean()
  rootOnly?: boolean;
}
