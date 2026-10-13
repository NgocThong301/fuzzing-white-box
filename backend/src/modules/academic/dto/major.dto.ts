import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMajorDto {
  @ApiProperty({ example: 'Kỹ thuật Máy tính', description: 'Tên ngành' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'CTCK', description: 'Mã ngành' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 1, description: 'ID của trường đại học' })
  @IsInt()
  universityId: number;
}

export class UpdateMajorDto {
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
}
