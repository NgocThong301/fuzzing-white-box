import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ListingStatus } from '@prisma/client';

export class SearchModerationDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ListingStatus, description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo seller ID' })
  @IsOptional()
  @IsInt()
  sellerId?: number;

  @ApiPropertyOptional({ description: 'Từ ngày (ISO format)' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Đến ngày (ISO format)' })
  @IsOptional()
  @IsString()
  toDate?: string;
}
