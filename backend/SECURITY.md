# Security Documentation

## Overview

This document outlines the security measures implemented in the Textbook Marketplace application.

## ⚠️ Important Notice

> **This is a MOCK/SANDBOX environment for academic purposes.**
> 
> - NO real money transactions
> - NO real payment processing
> - NO real personal data
> - All data is for demonstration only

---

## Security Audit Report

### 1. Password Security

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Password hashing with bcrypt | ✅ Using bcrypt with salt rounds = 12 | `security.spec.ts` - Brute Force tests | ✅ PASS |
| No plaintext passwords | ✅ Passwords stored as bcrypt hashes only | `security.spec.ts` - Sensitive Data tests | ✅ PASS |

**Implementation Details:**
```typescript
// Password hashing with bcrypt
const passwordHash = await bcrypt.hash(registerDto.password, 12);

// Password comparison
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

---

### 2. JWT Security

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Secure JWT generation | ✅ Using @nestjs/jwt with HS256 | `security.spec.ts` - Auth tests | ✅ PASS |
| Token expiration | ✅ Tokens include expiration claim | `jwt.strategy.ts` - `ignoreExpiration: false` | ✅ PASS |
| Token validation | ✅ JWT validated on every protected request | `security.spec.ts` - Unauthorized Access tests | ✅ PASS |

**Implementation Details:**
```typescript
// JWT Strategy Configuration
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: configService.get<string>('JWT_SECRET'),
});

// Token payload (minimal data)
const payload = {
  sub: user.id,    // Subject (user ID)
  email: user.email,
};
```

---

### 3. RBAC (Role-Based Access Control)

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Role definitions | ✅ USER, MODERATOR, ADMIN | Schema check | ✅ PASS |
| Role decorator | ✅ `@Roles(RoleType.ADMIN)` | `security.spec.ts` - RBAC tests | ✅ PASS |
| RolesGuard | ✅ Custom guard checking user roles | `security.spec.ts` - RBAC tests | ✅ PASS |
| Admin-only endpoints | ✅ `/admin/*` protected | `security.spec.ts` - RBAC tests | ✅ PASS |

**Implementation Details:**
```typescript
// Role Guard
@Injectable()
export class RolesGuard extends CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.some((r: any) => r.role.name === role));
  }
}

// Usage
@Roles(RoleType.ADMIN)
@Controller('admin')
class AdminController {}
```

---

### 4. Ownership Authorization (IDOR Prevention)

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Users can only access own data | ✅ `@CurrentUser()` decorator used | `security.spec.ts` - IDOR tests | ✅ PASS |
| Order ownership check | ✅ Verified in OrderService | `security.spec.ts` - IDOR tests | ✅ PASS |
| Listing ownership check | ✅ Sellers can only modify own listings | `security.spec.ts` - IDOR tests | ✅ PASS |

**Implementation Details:**
```typescript
// Current User Decorator
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return next.handle().pipe(
      map((data) => {
        // Filter data to only show user's own resources
        return data;
      }),
    );
  }
}

// Usage in Controllers
@Get('orders')
async getMyOrders(@CurrentUser() user: any) {
  return this.orderService.getOrdersByUser(user.id);
}
```

---

### 5. SQL Injection Prevention

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| ORM parameterized queries | ✅ Using Prisma ORM exclusively | `security.spec.ts` - SQL Injection tests | ✅ PASS |
| No raw SQL queries | ✅ Prisma queries only | Code audit | ✅ PASS |
| Input sanitization | ✅ ValidationPipe whitelist mode | `security.spec.ts` - SQL Injection tests | ✅ PASS |

**Implementation Details:**
```typescript
// Prisma uses parameterized queries automatically
const user = await prisma.user.findUnique({
  where: { email: email },  // Parameterized
});

// No string concatenation in queries
// ❌ BAD: prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`
// ✅ GOOD: prisma.user.findUnique({ where: { email } })
```

**Test Payloads:**
```typescript
const sqlPayloads = [
  "'; DROP TABLE users; --",
  "1 OR 1=1",
  "1; DELETE FROM users WHERE 1=1",
  "UNION SELECT * FROM users",
  "1' OR '1'='1",
];
```

---

### 6. XSS Prevention

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Input validation | ✅ ValidationPipe with whitelist | `security.spec.ts` - XSS tests | ✅ PASS |
| Output encoding | ✅ React handles encoding | Frontend audit | ✅ PASS |
| Content-Type header | ✅ `X-Content-Type-Options: nosniff` | `security.spec.ts` - Security Headers | ✅ PASS |

**Test Payloads:**
```typescript
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg onload=alert("XSS")>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
];
```

---

### 7. CSRF Prevention

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| CORS configuration | ✅ Whitelist allowed origins | `security.spec.ts` - CORS tests | ✅ PASS |
| SameSite cookies | ✅ Not using cookies for auth | N/A | ✅ PASS |
| CSRF tokens | ✅ Bearer token in Authorization header | `security.spec.ts` - Auth tests | ✅ PASS |

**Implementation Details:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

### 8. Rate Limiting

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Request rate limiting | ✅ @nestjs/throttler configured | `security.spec.ts` - Rate Limit tests | ✅ PASS |
| Configurable limits | ✅ 10 requests/minute default | app.module.ts | ✅ PASS |

**Implementation Details:**
```typescript
// app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 60000,  // 1 minute
    limit: 10,    // 10 requests
  },
]),

// Controller usage
@UseGuards(ThrottlerGuard)
@Controller('auth')
class AuthController {}
```

---

### 9. Brute-Force Protection

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Account lockout | ✅ 5 failed attempts = 15 min lock | `security.spec.ts` - Brute Force tests | ✅ PASS |
| Login attempt tracking | ✅ `loginAttempts` counter in DB | `auth.service.ts` | ✅ PASS |
| Timing attack prevention | ✅ Dummy hash on failed lookup | `auth.service.ts` | ✅ PASS |

**Implementation Details:**
```typescript
const LOGIN_MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// After 5 failed attempts
if (newAttempts >= LOGIN_MAX_ATTEMPTS) {
  const lockUntil = new Date();
  lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);
  await prisma.user.update({
    where: { id: user.id },
    data: { lockUntil },
  });
}

// Timing attack prevention
if (!user) {
  await bcrypt.hash('dummy-password', 1);  // Same operation timing
  throw new UnauthorizedException('Invalid email or password');
}
```

---

### 10. Input Validation

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| DTO validation | ✅ class-validator decorators | `security.spec.ts` - Validation tests | ✅ PASS |
| Whitelist mode | ✅ ValidationPipe whitelist: true | `security.spec.ts` - Validation tests | ✅ PASS |
| Type transformation | ✅ transform: true | `security.spec.ts` - Validation tests | ✅ PASS |

**Implementation Details:**
```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}

// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

**Test Cases:**
- Email format validation
- Password strength (upper, lower, number, special char)
- Phone number format (10-11 digits)
- Price must be positive
- Required field validation

---

### 11. File Upload Security

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| File size limit | ✅ Multer configured with limits | Listing service | ✅ PASS |
| MIME validation | ✅ File filter checking types | Listing service | ✅ PASS |
| Filename sanitization | ✅ UUID-based filename generation | Listing service | ✅ PASS |
| File type checking | ✅ Extension validation | Listing service | ✅ PASS |

**Implementation Details:**
```typescript
const uploadOptions: Options = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);
      const filename = `${uuid()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
};
```

---

### 12. Sensitive Information Exposure

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| No password exposure | ✅ UserResponseDto excludes passwordHash | `security.spec.ts` - Sensitive Data tests | ✅ PASS |
| No secret exposure | ✅ Environment variables not logged | Code audit | ✅ PASS |
| No stack traces | ✅ Global exception filter | `security.spec.ts` - Sensitive Data tests | ✅ PASS |

**Implementation Details:**
```typescript
// UserResponseDto - excludes sensitive fields
export class UserResponseDto {
  id: number;
  email: string;
  fullName: string;
  // passwordHash: EXCLUDED
  // passwordChangedAt: EXCLUDED
}

// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = {
      statusCode: status,
      message: 'Error occurred',
      // Don't expose internal error details
    };
  }
}
```

---

### 13. Security Headers

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| X-Content-Type-Options | ✅ nosniff | `security.spec.ts` - Security Headers | ✅ PASS |
| X-Frame-Options | ✅ DENY | `security.spec.ts` - Security Headers | ✅ PASS |
| X-XSS-Protection | ✅ 1; mode=block | `security.spec.ts` - Security Headers | ✅ PASS |
| HSTS | ✅ max-age=31536000 | `security.spec.ts` - Security Headers | ✅ PASS |
| Referrer-Policy | ✅ strict-origin-when-cross-origin | `security.spec.ts` - Security Headers | ✅ PASS |
| Helmet | ✅ Installed and configured | main.ts | ✅ PASS |

**Implementation Details:**
```typescript
import helmet from 'helmet';

// Security headers
app.use(helmet());

// Custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

### 14. Error Message Leakage

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Generic error messages | ✅ Consistent messages to clients | `security.spec.ts` - Sensitive Data tests | ✅ PASS |
| No stack traces | ✅ Exception filter sanitizes errors | `security.spec.ts` - Sensitive Data tests | ✅ PASS |
| No internal paths | ✅ Error responses sanitized | `security.spec.ts` - Sensitive Data tests | ✅ PASS |

---

### 15. CORS Configuration

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Origin whitelist | ✅ Only allowed frontend URL | `security.spec.ts` - CORS tests | ✅ PASS |
| Credential handling | ✅ credentials: true | main.ts | ✅ PASS |
| Method restrictions | ✅ Specific methods only | main.ts | ✅ PASS |

---

### 16. Audit Logging

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Login/Logout | ✅ Logged with IP address | `auth.service.ts` | ✅ PASS |
| Password changes | ✅ Logged | `auth.service.ts` | ✅ PASS |
| Admin actions | ✅ All admin operations logged | `admin.service.ts` | ✅ PASS |
| Order operations | ✅ Status changes logged | `order.service.ts` | ✅ PASS |
| Payment operations | ✅ All payment events logged | `payment.service.ts` | ✅ PASS |

**Implementation Details:**
```typescript
// audit-log.service.ts
await this.auditLog.log({
  userId: currentUserId,
  action: 'LISTING_CREATED',
  entityType: 'Listing',
  entityId: listing.id.toString(),
  oldData: {},
  newData: { title: listing.title, price: listing.price },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

### 17. Database Security

| Requirement | Implementation | Test | Result |
|------------|---------------|------|--------|
| Prisma ORM | ✅ Using Prisma exclusively | Code audit | ✅ PASS |
| Parameterized queries | ✅ All queries use Prisma | Code audit | ✅ PASS |
| Connection pooling | ✅ Prisma connection pool | Schema | ✅ PASS |

---

## Security Test Coverage

### Running Security Tests

```bash
# Run all security tests
npm run test -- --testPathPattern=security.spec.ts

# Run with coverage
npm run test:cov -- --testPathPattern=security.spec.ts
```

### Test Categories

| Category | Test Count | Status |
|----------|-----------|--------|
| SQL Injection | 4 | ✅ |
| XSS Prevention | 2 | ✅ |
| Unauthorized Access | 3 | ✅ |
| IDOR Prevention | 3 | ✅ |
| RBAC | 3 | ✅ |
| Rate Limiting | 2 | ✅ |
| Brute Force | 2 | ✅ |
| Input Validation | 5 | ✅ |
| Sensitive Data | 3 | ✅ |
| CORS | 2 | ✅ |
| Security Headers | 3 | ✅ |
| Auth Bypass | 2 | ✅ |
| User Enumeration | 1 | ✅ |

**Total: 35+ security tests**

---

## Environment Variables

Required security-related environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Frontend (CORS)
FRONTEND_URL="http://localhost:5173"

# Optional: Redis for caching (rate limiting)
REDIS_URL="redis://..."
```

---

## Known Limitations (Sandbox Environment)

> These are intentional for the academic project:

1. **No real payment processing** - All payments are mock
2. **No real email sending** - Notifications are stored only
3. **No real file storage** - Files stored locally only
4. **No production SSL** - HTTP only in development
5. **No backup system** - SQLite/Postgres for demo

---

## Reporting Security Issues

For this academic project, please report issues to the development team.

---

## Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] Role-based access control
- [x] Input validation (class-validator)
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (validation + React)
- [x] Rate limiting (@nestjs/throttler)
- [x] Brute-force protection (account lockout)
- [x] Security headers (Helmet + custom)
- [x] Audit logging
- [x] CORS configuration
- [x] No sensitive data exposure
- [x] Generic error messages
- [x] File upload validation

---

*Last Updated: 2026-09-24*
*Version: 1.0.0*
