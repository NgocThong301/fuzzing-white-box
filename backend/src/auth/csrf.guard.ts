import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfService } from './csrf.service';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly csrfService: CsrfService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Skip for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(method)) {
      return true;
    }

    // Check if CSRF check should be skipped
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(
      'skipCsrfCheck',
      [context.getHandler(), context.getClass()],
    );
    if (skipCsrf) {
      return true;
    }

    // Skip for non-API routes
    if (!request.path.startsWith('/api/')) {
      return true;
    }

    // Public endpoints don't need CSRF
    const publicEndpoints = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/books',
      '/api/categories',
      '/api/courses',
      '/api/universities',
      '/api/majors',
      '/api/listings',
      '/api/health',
      '/api/sitemap',
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      request.path.startsWith(endpoint),
    );
    if (isPublic) {
      return true;
    }

    // For authenticated requests, validate CSRF token
    const user = (request as Request & { user?: { id?: number } }).user;
    if (user?.id) {
      const csrfToken = request.headers['x-csrf-token'] as string | undefined;
      const cookies = (request as Request & { cookies?: Record<string, string> }).cookies;
      const cookieToken = cookies?.csrfToken;

      // Allow if no token provided (backwards compatibility with warning)
      if (!csrfToken && !cookieToken) {
        // In strict mode, this should throw
        // For now, we'll allow but log
        console.warn('CSRF token missing for authenticated request');
        return true; // Allow for now to avoid breaking existing functionality
      }

      const tokenToValidate = csrfToken ?? cookieToken;
      if (!tokenToValidate) {
        return true;
      }

      const isValid = this.csrfService.validateToken(user.id, tokenToValidate);

      if (!isValid) {
        throw new ForbiddenException('Invalid or expired CSRF token');
      }

      return true;
    }

    // Non-authenticated requests don't need CSRF validation
    return true;
  }
}
