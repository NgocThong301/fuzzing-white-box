import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

export interface CsrfTokenData {
  token: string;
  createdAt: Date;
}

// Store tokens in memory (in production, use Redis)
const tokenStore = new Map<string, CsrfTokenData>();

@Injectable()
export class CsrfService {
  private readonly tokenLength = 32;

  /**
   * Generate a new CSRF token
   */
  generateToken(userId: string | number): string {
    const token = crypto.randomBytes(this.tokenLength).toString('hex');
    const tokenKey = `${userId}:${token}`;

    tokenStore.set(tokenKey, {
      token,
      createdAt: new Date(),
    });

    // Clean up old tokens (older than 1 hour)
    this.cleanupTokens();

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(userId: string | number, token: string): boolean {
    if (!token) {
      return false;
    }

    const tokenKey = `${userId}:${token}`;
    const tokenData = tokenStore.get(tokenKey);

    if (!tokenData) {
      return false;
    }

    // Token expires after 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (tokenData.createdAt < oneHourAgo) {
      tokenStore.delete(tokenKey);
      return false;
    }

    // Remove token after use (single-use)
    tokenStore.delete(tokenKey);

    return true;
  }

  /**
   * Get token creation time for frontend
   */
  getTokenTimestamp(userId: string | number, token: string): Date | null {
    const tokenKey = `${userId}:${token}`;
    const tokenData = tokenStore.get(tokenKey);
    return tokenData?.createdAt ?? null;
  }

  /**
   * Cleanup expired tokens
   */
  private cleanupTokens(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [key, data] of tokenStore.entries()) {
      if (data.createdAt < oneHourAgo) {
        tokenStore.delete(key);
      }
    }
  }

  /**
   * Clear all tokens for a user (on logout)
   */
  clearUserTokens(userId: string | number): void {
    const prefix = `${userId}:`;
    for (const key of tokenStore.keys()) {
      if (key.startsWith(prefix)) {
        tokenStore.delete(key);
      }
    }
  }
}

/**
 * CSRF Middleware
 * Validates CSRF token for state-changing requests
 */
@Injectable()
export class CsrfMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: () => void) {
    // Skip for safe HTTP methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    // Skip for non-API routes (static files)
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    // Skip for public endpoints
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
      req.path.startsWith(endpoint),
    );

    if (isPublic) {
      return next();
    }

    // For authenticated routes, we validate the token
    // The actual token validation happens in the guard
    next();
  }
}
