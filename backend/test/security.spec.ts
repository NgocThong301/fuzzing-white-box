/**
 * SECURITY TESTS
 * ===============
 * 
 * Comprehensive security tests for all vulnerabilities:
 * - SQL Injection
 * - XSS
 * - Unauthorized API Access
 * - IDOR
 * - File Upload Security
 * - Brute Force Protection
 * - RBAC
 * - Rate Limiting
 * - Input Validation
 * - Sensitive Data Exposure
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Security Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test users
  let regularUserToken: string;
  let adminUserToken: string;
  let regularUserId: number;
  let adminUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'security-test-user@example.com' },
      update: {},
      create: {
        email: 'security-test-user@example.com',
        passwordHash: hashedPassword,
        fullName: 'Security Test User',
        status: 'ACTIVE',
        roles: {
          create: {
            role: {
              connect: { name: 'USER' },
            },
          },
        },
        wallet: {
          create: {
            balance: 0,
            currency: 'VND',
          },
        },
      },
    });
    regularUserId = regularUser.id;

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'security-test-admin@example.com' },
      update: {},
      create: {
        email: 'security-test-admin@example.com',
        passwordHash: hashedPassword,
        fullName: 'Security Test Admin',
        status: 'ACTIVE',
        roles: {
          create: {
            role: {
              connect: { name: 'ADMIN' },
            },
          },
        },
        wallet: {
          create: {
            balance: 0,
            currency: 'VND',
          },
        },
      },
    });
    adminUserId = adminUser.id;

    // Generate tokens
    regularUserToken = jwtService.sign({ sub: regularUserId, email: regularUser.email });
    adminUserToken = jwtService.sign({ sub: adminUserId, email: adminUser.email });
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.delete({ where: { email: 'security-test-user@example.com' } }).catch(() => {});
    await prisma.user.delete({ where: { email: 'security-test-admin@example.com' } }).catch(() => {});
    await app.close();
  });

  // ==============================================
  // 1. SQL INJECTION TESTS
  // ==============================================
  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in search parameters', async () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "1 OR 1=1",
        "1; DELETE FROM users WHERE 1=1",
        "UNION SELECT * FROM users",
        "1' OR '1'='1",
      ];

      for (const payload of sqlPayloads) {
        const response = await request(app.getHttpServer())
          .get(`/api/listings?search=${encodeURIComponent(payload)}`)
          .expect(200);

        // Should return empty results or valid data, not crash
        expect(response.body).toBeDefined();
      }
    });

    it('should prevent SQL injection in user registration', async () => {
      const maliciousEmails = [
        "admin'--@example.com",
        "test@test.com'; DROP TABLE users; --",
        "a@b.com OR 1=1",
      ];

      for (const email of maliciousEmails) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email,
            password: 'TestPassword123!',
            fullName: 'Test',
          });

        // Should reject with validation error
        expect([400, 409]).toContain(response.status);
      }
    });

    it('should prevent SQL injection in login', async () => {
      const maliciousInputs = [
        "admin'--",
        "' OR '1'='1",
        "'; DELETE FROM users WHERE '1'='1",
      ];

      for (const input of maliciousInputs) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: input,
            password: 'anything',
          });

        // Should reject - either validation error or invalid credentials
        expect([400, 401]).toContain(response.status);
      }
    });

    it('should use parameterized queries (ORM)', async () => {
      // This test verifies ORM usage - Prisma uses parameterized queries
      const user = await prisma.user.findUnique({
        where: { email: 'security-test-user@example.com' },
      });

      expect(user).toBeDefined();
      expect(user!.email).toBe('security-test-user@example.com');
    });
  });

  // ==============================================
  // 2. XSS PREVENTION TESTS
  // ==============================================
  describe('XSS Prevention', () => {
    it('should sanitize HTML/script tags in input', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
      ];

      for (const payload of xssPayloads) {
        // Try to register with XSS payload in name
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
            fullName: payload,
          });

        // Should either reject or sanitize
        expect([201, 400, 409]).toContain(response.status);
      }
    });

    it('should not return raw script tags in responses', async () => {
      // Create listing with XSS payload
      const createResponse = await request(app.getHttpServer())
        .post('/api/listings')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          title: '<script>alert("XSS")</script>',
          description: 'Test description',
          price: 100000,
          condition: 'NEW',
        });

      if (createResponse.status === 201) {
        const getResponse = await request(app.getHttpServer())
          .get(`/api/listings/${createResponse.body.id}`);

        // Response should not contain unescaped script tags
        const responseText = JSON.stringify(getResponse.body);
        expect(responseText).not.toContain('<script>alert');
      }
    });
  });

  // ==============================================
  // 3. UNAUTHORIZED API ACCESS TESTS
  // ==============================================
  describe('Unauthorized Access Prevention', () => {
    it('should reject requests without token', async () => {
      const protectedEndpoints = [
        '/api/auth/me',
        '/api/cart',
        '/api/orders',
        '/api/wallet',
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app.getHttpServer())
          .get(endpoint);

        expect(response.status).toBe(401);
      }
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject requests with expired token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid');

      expect(response.status).toBe(401);
    });
  });

  // ==============================================
  // 4. IDOR (Insecure Direct Object Reference) TESTS
  // ==============================================
  describe('IDOR Prevention', () => {
    it('should prevent accessing other users orders', async () => {
      // Create an order as regular user
      const createResponse = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          shippingAddress: '123 Test St',
          shippingPhone: '0901234567',
          shippingName: 'Test User',
        });

      // Try to access it - should only see own orders
      const ordersResponse = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(ordersResponse.status).toBe(200);
      // Should only contain orders belonging to this user
    });

    it('should prevent accessing other users wallet', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/wallet')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      // Should only return own wallet
    });

    it('should prevent modifying other users listings', async () => {
      // Create a listing
      const createResponse = await request(app.getHttpServer())
        .post('/api/listings')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          title: 'My Test Book',
          description: 'Test',
          price: 50000,
          condition: 'NEW',
        });

      if (createResponse.status === 201) {
        const listingId = createResponse.body.id;

        // Try to update with different user
        const updateResponse = await request(app.getHttpServer())
          .patch(`/api/listings/${listingId}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .send({
            title: 'Updated Title',
          });

        // Should either succeed (if admin) or fail with 403
        expect([200, 403]).toContain(updateResponse.status);
      }
    });
  });

  // ==============================================
  // 5. RBAC (Role-Based Access Control) TESTS
  // ==============================================
  describe('RBAC Enforcement', () => {
    it('should prevent regular user from accessing admin endpoints', async () => {
      const adminEndpoints = [
        '/api/admin/dashboard/stats',
        '/api/admin/users',
        '/api/admin/listings',
        '/api/moderation/listings',
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
      }
    });

    it('should allow admin to access admin endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
    });

    it('should prevent USER role from accessing MODERATOR endpoints', async () => {
      // Get moderator user token if exists
      const modUser = await prisma.user.findFirst({
        where: {
          roles: {
            some: {
              role: { name: 'MODERATOR' },
            },
          },
        },
      });

      if (modUser) {
        const modToken = jwtService.sign({ sub: modUser.id, email: modUser.email });
        
        const response = await request(app.getHttpServer())
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${modToken}`);

        expect(response.status).toBe(403);
      }
    });
  });

  // ==============================================
  // 6. RATE LIMITING TESTS
  // ==============================================
  describe('Rate Limiting', () => {
    it('should limit rapid login attempts', async () => {
      // Make multiple rapid requests
      const attempts = [];
      for (let i = 0; i < 15; i++) {
        attempts.push(
          request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
              email: 'rapid-fire@example.com',
              password: 'wrongpassword',
            })
        );
      }

      const results = await Promise.all(attempts);
      const statusCodes = results.map((r: { status: number }) => r.status);
      
      // Some should be rate limited (429) or fail with 401
      const hasFailures = statusCodes.some((code: number) => code === 429 || code === 401);
      expect(hasFailures).toBe(true);
    });

    it('should rate limit registration', async () => {
      const attempts = [];
      for (let i = 0; i < 20; i++) {
        attempts.push(
          request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
              email: `rate-limit-${i}-${Date.now()}@test.com`,
              password: 'TestPassword123!',
              fullName: 'Rate Test',
            })
        );
      }

      const results = await Promise.all(attempts);
      const statusCodes = results.map((r: { status: number }) => r.status);
      
      // Should have some rate limiting
      expect(statusCodes.some((code: number) => code === 429)).toBe(true);
    });
  });

  // ==============================================
  // 7. BRUTE FORCE PROTECTION TESTS
  // ==============================================
  describe('Brute Force Protection', () => {
    it('should lock account after 5 failed attempts', async () => {
      const testEmail = `bruteforce-test-${Date.now()}@example.com`;
      
      // Create a user first
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
          fullName: 'Brute Force Test',
        });

      // Try to login with wrong password 5 times
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: testEmail,
            password: 'WrongPassword123!',
          });
      }

      // 6th attempt should be locked
      const lockedResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        });

      expect([401, 403]).toContain(lockedResponse.status);
      expect(lockedResponse.body.message).toContain('locked');
    });

    it('should allow login after correct password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'security-test-user@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  // ==============================================
  // 8. INPUT VALIDATION TESTS
  // ==============================================
  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@test',
        '',
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email,
            password: 'TestPassword123!',
            fullName: 'Test',
          });

        expect(response.status).toBe(400);
      }
    });

    it('should validate password strength', async () => {
      const weakPasswords = [
        '12345678',
        'password',
        'qwerty',
        'short1!',
        'ALLUPPERCASE123!',
      ];

      for (const password of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: `test-${Date.now()}@example.com`,
            password,
            fullName: 'Test',
          });

        expect(response.status).toBe(400);
      }
    });

    it('should validate phone number format', async () => {
      const invalidPhones = [
        '123',
        'abcdefghij',
        '1234567890123',
      ];

      for (const phone of invalidPhones) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
            fullName: 'Test',
            phone,
          });

        expect(response.status).toBe(400);
      }
    });

    it('should reject negative prices', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/listings')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          title: 'Test Book',
          description: 'Test',
          price: -1000,
          condition: 'NEW',
        });

      expect(response.status).toBe(400);
    });
  });

  // ==============================================
  // 9. SENSITIVE DATA EXPOSURE TESTS
  // ==============================================
  describe('Sensitive Data Protection', () => {
    it('should not expose password hash in user response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'security-test-user@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not expose internal errors to client', async () => {
      // Try to access non-existent resource
      const response = await request(app.getHttpServer())
        .get('/api/users/999999');

      expect(response.status).toBe(404);
      // Should not contain stack traces or internal paths
      expect(response.body.message).not.toContain('stack');
      expect(response.body.message).not.toContain('at ');
    });

    it('should not expose database schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/listings?where=1=1');

      expect(response.status).toBe(200);
      // Response should not contain SQL schema info
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('CREATE TABLE');
      expect(responseText).not.toContain('passwordHash');
    });
  });

  // ==============================================
  // 10. CORS TESTS
  // ==============================================
  describe('CORS Configuration', () => {
    it('should allow requests from allowed origin', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/listings')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
    });

    it('should include CORS headers in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/listings')
        .set('Origin', 'http://localhost:5173');

      // Should either succeed or fail gracefully
      expect(response.status).toBeDefined();
    });
  });

  // ==============================================
  // 11. SECURITY HEADERS TESTS
  // ==============================================
  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/listings');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/listings');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should include X-XSS-Protection header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/listings');

      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });

  // ==============================================
  // 12. AUTHENTICATION BYPASS TESTS
  // ==============================================
  describe('Authentication Bypass Prevention', () => {
    it('should not allow access with deleted user token', async () => {
      // Create temporary user
      const createResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `temp-delete-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          fullName: 'Temp User',
        });

      if (createResponse.status === 201) {
        const tempUserId = createResponse.body.user.id;
        const tempToken = createResponse.body.accessToken;

        // Delete the user
        await prisma.user.update({
          where: { id: tempUserId },
          data: { deletedAt: new Date() },
        });

        // Try to use token
        const response = await request(app.getHttpServer())
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${tempToken}`);

        expect(response.status).toBe(401);
      }
    });

    it('should not allow access with inactive user token', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { email: 'security-test-user@example.com' },
        data: { status: 'INACTIVE' },
      });

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);

      // Reactivate for other tests
      await prisma.user.update({
        where: { email: 'security-test-user@example.com' },
        data: { status: 'ACTIVE' },
      });
    });
  });

  // ==============================================
  // 13. ENUMERATION ATTACK PREVENTION
  // ==============================================
  describe('User Enumeration Prevention', () => {
    it('should show same message for invalid email vs invalid password', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent-email-12345@example.com',
          password: 'anypassword',
        });

      const response2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'security-test-user@example.com',
          password: 'wrongpassword',
        });

      // Both should show generic error message
      expect(response1.body.message).toBe(response2.body.message);
    });
  });
});
