import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, UserStatus, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ChangePasswordDto, UpdateProfileDto } from './dto';
import { UserResponseDto } from './responses/auth-response.dto';

const LOGIN_MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone already exists (if provided)
    if (registerDto.phone) {
      const existingPhone = await this.prismaService.user.findUnique({
        where: { phone: registerDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Get default USER role
    const userRole = await this.prismaService.role.findUnique({
      where: { name: RoleType.USER },
    });

    if (!userRole) {
      throw new BadRequestException('User role not found');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
        roles: {
          create: {
            roleId: userRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Create wallet for new user
    await this.prismaService.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: 'VND',
      },
    });

    // Create audit log
    await this.prismaService.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id.toString(),
        newData: { email: user.email, fullName: user.fullName },
      },
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      // Still do a password hash to prevent timing attacks
      await bcrypt.hash('dummy-password', 1);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new ForbiddenException(
        `Account is locked. Try again in ${remainingMinutes} minutes`,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;

      if (newAttempts >= LOGIN_MAX_ATTEMPTS) {
        // Lock the account
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);

        await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockUntil,
          },
        });

        // Audit log
        await this.prismaService.auditLog.create({
          data: {
            userId: user.id,
            action: 'ACCOUNT_LOCKED',
            entityType: 'User',
            entityId: user.id.toString(),
            newData: {
              reason: 'Too many failed login attempts',
              lockUntil: lockUntil.toISOString(),
              ipAddress,
            },
          },
        });

        throw new ForbiddenException(
          'Account locked due to too many failed login attempts. Try again in 15 minutes.',
        );
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts },
      });

      throw new UnauthorizedException(
        `Invalid email or password. ${LOGIN_MAX_ATTEMPTS - newAttempts} attempts remaining.`,
      );
    }

    // Check if user status is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // Reset login attempts on successful login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    // Generate token
    const token = this.generateToken(user);

    // Audit log
    await this.prismaService.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id.toString(),
        newData: { ipAddress },
      },
    });

    return {
      accessToken: token,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async logout(userId: number) {
    // Audit log
    await this.prismaService.auditLog.create({
      data: {
        userId,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: userId.toString(),
      },
    });

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if phone is being changed and if new phone is already taken
    if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
      const existingPhone = await this.prismaService.user.findUnique({
        where: { phone: updateProfileDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateProfileDto,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Audit log
    await this.prismaService.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        entityType: 'User',
        entityId: userId.toString(),
        newData: updateProfileDto as unknown as Prisma.InputJsonValue,
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);

    // Update password
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        // Reset login attempts after password change
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    // Audit log
    await this.prismaService.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: userId.toString(),
      },
    });

    return { message: 'Password changed successfully' };
  }

  private generateToken(user: Prisma.UserGetPayload<{ include: { roles: { include: { role: true } } } }>) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
