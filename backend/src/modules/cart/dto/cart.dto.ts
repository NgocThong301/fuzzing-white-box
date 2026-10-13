import {
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID của listing' })
  @IsInt()
  listingId: number;

  @ApiPropertyOptional({ example: 1, description: 'Số lượng', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quantity?: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'Số lượng mới', minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}
