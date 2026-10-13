# Textbook Marketplace - C2C Platform for Students

A peer-to-peer marketplace for buying and selling textbooks, built with modern technologies.

---

## 🚀 Quick Start (5 Steps)

```bash
# 1. Clone and enter directory
git clone <repo-url> && cd TMDT

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker compose up -d

# 4. Wait for services to be ready (~2-3 minutes)
docker compose logs -f backend

# 5. Access the application
# Frontend:  http://localhost:5173
# API:       http://localhost:3000
# Swagger:   http://localhost:3000/api/docs
```

**Login:** `admin@demo.local` / `Demo123!`

---

## 📋 Project Overview

**Project Name:** Textbook Marketplace (SachGiaRe.vn)
**Project Type:** C2C (Consumer-to-Consumer) E-commerce Platform
**Target Users:** University/College students

### ✅ Implemented Features

| Module | Status |
|--------|--------|
| User Authentication (JWT) | ✅ Complete |
| Role-Based Access Control | ✅ Complete |
| Book Catalog & Listings | ✅ Complete |
| Search & Filter | ✅ Complete |
| Order Management | ✅ Complete |
| Cart System | ✅ Complete |
| Wallet & Escrow | ✅ Complete |
| Reviews & Ratings | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Content Moderation | ✅ Complete |
| SEO Optimization | ✅ Complete |
| Legal Compliance Pages | ✅ Complete |
| Multi-step Checkout | ✅ Complete |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool |
| React Router | Client-side routing |
| TanStack Query | Data fetching |
| Tailwind CSS | Styling |

### Backend

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework |
| TypeScript | Type safety |
| Prisma ORM | Database ORM |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password hashing |
| Swagger/OpenAPI | API documentation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker Compose | Container orchestration |
| PostgreSQL | Persistent database |

---

## 📁 Project Structure

```
TMDT/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/              # Authentication (JWT)
│   │   ├── users/             # User management
│   │   ├── roles/             # Role management
│   │   ├── books/             # Book catalog
│   │   ├── categories/        # Categories
│   │   ├── courses/           # Courses
│   │   ├── listings/          # Book listings
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Payment simulation
│   │   ├── wallet/            # Wallet system
│   │   ├── escrow/            # Escrow system
│   │   ├── reviews/           # Reviews & ratings
│   │   ├── favorites/         # Favorites
│   │   ├── notifications/      # Notifications
│   │   ├── reports/           # Reports & disputes
│   │   ├── admin/             # Admin dashboard
│   │   ├── moderation/         # Content moderation
│   │   ├── seo/               # SEO module
│   │   └── common/            # Shared utilities
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeder
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client & utilities
│   │   └── types/             # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── docs/
│   ├── deployment.md           # Deployment guide
│   ├── testing/
│   │   └── test-cases.md      # Test cases (55 tests)
│   └── legal-compliance.md    # Legal compliance
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
├── start.sh                   # Quick start script
└── README.md
```

---

## 🔧 Docker Deployment

### Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| backend | 3000 | NestJS API server |
| frontend | 5173 | React application |

### Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove data
docker compose down -v

# Rebuild
docker compose build --no-cache
docker compose up -d
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_32_char_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
```

---

## 📧 Demo Accounts

| Role | Email | Password | Balance |
|------|-------|----------|---------|
| Admin | admin@demo.local | Demo123! | 10,000,000 VND |
| Moderator | moderator@demo.local | Demo123! | 500,000 VND |
| Seller | seller@demo.local | Demo123! | 2,500,000 VND |
| Buyer | buyer@demo.local | Demo123! | 5,000,000 VND |

### Demo Scripts
```bash
cd backend
npm run db:demo     # Load demo data (recommended for demo)
npm run db:seed     # Load production seed data
```

### Demo Scenario
See [DEMO_SCENARIO.md](docs/DEMO_SCENARIO.md) for video demo script.

---

## 🔗 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |
| Health Check | http://localhost:3000/health |

---

## 📦 Available Scripts

### Docker Scripts
```bash
./start.sh              # Quick start (recommended)
./test-clean-install.sh # Test fresh installation
```

### Backend Scripts
```bash
cd backend
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data (production)
npm run db:demo         # Seed demo data (for video demo)
npm run db:studio       # Prisma Studio
npm run test            # Run tests
npm run build           # Build for production
```

### Frontend Scripts
```bash
cd frontend
npm run dev             # Development server
npm run build           # Production build
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/deployment.md) | Full deployment instructions |
| [Test Cases](docs/testing/test-cases.md) | 55 test cases |
| [Legal Compliance](docs/legal-compliance.md) | Legal requirements |
| [Marketing](MARKETING.md) | Marketing strategy |
| [SEO](SEO.md) | SEO documentation |
| [Advertising Script](ADVERTISING_SCRIPT.md) | Ad creative |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT tokens with refresh |
| Password | bcrypt hashing |
| Rate Limiting | NestJS Throttler |
| Input Validation | class-validator |
| SQL Injection | Prisma ORM (parameterized) |
| XSS Prevention | Input sanitization |
| RBAC | Role-based permissions |
| IDOR Protection | Ownership checks |
| Security Headers | Helmet.js |

---

## 💳 Payment Simulation

⚠️ **This is a student project** - No real payments are processed.

| Component | Status |
|-----------|--------|
| Wallet | ✅ Simulated balance |
| Payments | ✅ Mock transactions |
| Escrow | ✅ Fund holding simulation |
| Withdrawals | ✅ Pending simulation |

---

## 📝 API Documentation

After starting the backend, visit:
- **Swagger UI:** http://localhost:3000/api/docs

### Key Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | `POST /api/auth/register` | Register new user |
| Auth | `POST /api/auth/login` | Login |
| Books | `GET /api/books` | List books |
| Listings | `GET /api/listings` | Search listings |
| Orders | `POST /api/orders` | Create order |
| Payments | `POST /api/payments` | Process payment |
| Wallet | `GET /api/wallet` | Get wallet balance |

---

## ⚙️ Development Setup

### Prerequisites
- Node.js >= 18.0.0
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start database
docker compose up -d postgres

# 4. Run migrations
npm run db:generate
npm run db:push

# 5. Seed data (optional)
npm run db:seed

# 6. Start dev servers
npm run dev
```

---

## ❓ Troubleshooting

### Database Connection Failed
```bash
docker compose logs postgres
docker compose exec postgres psql -U textbook -d textbook_marketplace
```

### Backend Not Starting
```bash
docker compose logs backend
docker compose build backend
```

### Migration Issues
```bash
docker compose exec backend npx prisma migrate reset --force
```

---

## 📄 License

This project is for **educational purposes only**.

## 👥 Authors

Student Project - University Assignment (TMĐT 2026)
