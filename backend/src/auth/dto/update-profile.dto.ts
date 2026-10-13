import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van B', description: 'Full name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Phone number must be 10 or 11 digits' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 1, description: 'University ID' })
  @IsOptional()
  @IsString()
  universityId?: number;
}
