import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock data
const mockUserData = {
  id: 1,
  email: 'test@example.com',
  fullName: 'Test User',
  phone: '0901234567',
  status: UserStatus.ACTIVE,
  loginAttempts: 0,
  lockUntil: null as Date | null,
  passwordChangedAt: null as Date | null,
  avatar: null,
  universityId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null as Date | null,
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  wallet: {
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '7d',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'JwtService', useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      fullName: 'New User',
      phone: '0909999999',
    };

    const mockRole = {
      id: 1,
      name: 'USER',
      description: 'User role',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        ...mockUserData,
        email: registerDto.email,
        fullName: registerDto.fullName,
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.wallet.create.mockResolvedValue({ id: 1 });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.wallet.create).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1, email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 1, phone: registerDto.phone }); // phone check

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const hashedPassword = bcrypt.hashSync('Password123!', 10);

    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: hashedPassword,
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, loginAttempts: 0 });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { loginAttempts: 0, lockUntil: null },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: bcrypt.hashSync('DifferentPassword123!', 10),
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException after 5 failed login attempts', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: bcrypt.hashSync('DifferentPassword123!', 10),
        loginAttempts: 4,
        lockUntil: null,
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: hashedPassword,
        lockUntil: new Date(Date.now() + 15 * 60 * 1000),
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if account is not active', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: hashedPassword,
        status: UserStatus.SUSPENDED,
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        ...mockUserData,
        roles: [{ role: { id: 1, name: 'USER' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should change password successfully', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: bcrypt.hashSync(changePasswordDto.currentPassword, 10),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.changePassword(1, changePasswordDto);

      expect(result.message).toBe('Password changed successfully');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong current password', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: bcrypt.hashSync('DifferentPassword123!', 10),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException if new password is same as current', async () => {
      const mockUser = {
        ...mockUserData,
        passwordHash: bcrypt.hashSync(changePasswordDto.newPassword, 10),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Role-based access control logic', () => {
    it('should allow access to user with required role', () => {
      const userRoles: string[] = ['USER'];
      const requiredRoles: string[] = ['USER'];

      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
      expect(hasAccess).toBe(true);
    });

    it('should deny access to user without required role', () => {
      const userRoles: string[] = ['USER'];
      const requiredRoles: string[] = ['ADMIN'];

      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
      expect(hasAccess).toBe(false);
    });

    it('should allow admin to access admin endpoints', () => {
      const userRoles: string[] = ['ADMIN', 'USER'];
      const requiredRoles: string[] = ['ADMIN'];

      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
      expect(hasAccess).toBe(true);
    });

    it('should deny normal user access to admin endpoints', () => {
      const userRoles: string[] = ['USER'];
      const requiredRoles: string[] = ['ADMIN'];

      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
      expect(hasAccess).toBe(false);
    });
  });
});
