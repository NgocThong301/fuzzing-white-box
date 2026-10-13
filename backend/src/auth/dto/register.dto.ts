import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Password with min 8 chars, 1 upper, 1 lower, 1 number, 1 special' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)',
  })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Phone number must be 10 or 11 digits' })
  phone?: string;
}
