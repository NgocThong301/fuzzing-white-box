import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User, Role, UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  avatar?: string | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  universityId?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [RoleDto] })
  roles: RoleDto[];

  static fromEntity(user: User & { roles: (UserRole & { role: Role })[] }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      universityId: user.universityId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map((ur) => RoleDto.fromEntity(ur.role)),
    };
  }
}

export class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  static fromEntity(role: Role): RoleDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
    };
  }
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserResponseDto;

  static fromTokens(accessToken: string, user: UserResponseDto): AuthResponseDto {
    return { accessToken, user };
  }
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;

  static of(message: string): MessageResponseDto {
    return { message };
  }
}
