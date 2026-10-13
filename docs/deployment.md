# Deployment Guide - Textbook Marketplace

**Version:** 1.0  
**Last Updated:** 2026-09-25

---

## Table of Contents

1. [Requirements](#1-requirements)
2. [Clone Project](#2-clone-project)
3. [Configure Environment](#3-configure-environment)
4. [Docker Compose Up](#4-docker-compose-up)
5. [Database Migration](#5-database-migration)
6. [Seed Data](#6-seed-data)
7. [Access URLs](#7-access-urls)
8. [Test Accounts](#8-test-accounts)

---

## 1. Requirements

### Software Requirements

| Software | Version | Description |
|----------|---------|-------------|
| Docker | 20.10+ | Container platform |
| Docker Compose | 2.0+ | Multi-container orchestration |
| Git | 2.0+ | Version control |

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disk | 10 GB | 20+ GB |

### Ports Required

| Port | Service | Description |
|------|---------|-------------|
| 5432 | PostgreSQL | Database |
| 3000 | Backend API | NestJS server |
| 5173 | Frontend | Vite dev server |

---

## 2. Clone Project

```bash
# Clone the repository
git clone <repository-url>
cd TMDT

# Or create project directory
mkdir textbook-marketplace
cd textbook-marketplace
```

---

## 3. Configure Environment

### 3.1 Copy Environment Template

```bash
# Copy main .env file
cp .env.example .env

# Configure backend .env
cp backend/.env.example backend/.env

# Configure frontend .env
cp frontend/.env.example frontend/.env
```

### 3.2 Edit Main .env File

```bash
# Edit with your preferred editor
nano .env
```

**Required changes:**

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=generate_a_long_random_string_at_least_32_chars

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password

# URLs
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### 3.3 Generate Secure Values

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Encryption Key
openssl rand -hex 16
```

---

## 4. Docker Compose Up

### 4.1 Quick Start (Automated)

```bash
# Make start script executable
chmod +x start.sh

# Run startup script
./start.sh
```

### 4.2 Manual Start (Step by Step)

```bash
# Step 1: Start PostgreSQL only
docker compose up -d postgres

# Step 2: Wait for database to be ready
# (Docker Compose will handle this with healthcheck)

# Step 3: Start all services
docker compose up -d
```

### 4.3 Verify Services

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f
```

**Expected output:**
```
NAME                STATUS
textbook-postgres   Up (healthy)
textbook-backend    Up (healthy)
textbook-frontend   Up
```

---

## 5. Database Migration

### 5.1 Automatic (Recommended)

Migrations run automatically when the backend container starts using the Dockerfile CMD:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
```

### 5.2 Manual Migration

```bash
# Run migrations manually
docker compose exec backend npx prisma migrate deploy

# Or with status
docker compose exec backend npx prisma migrate status
```

### 5.3 Reset Database (Development Only)

⚠️ **WARNING: This deletes all data!**

```bash
# Reset and re-run migrations
docker compose exec backend npx prisma migrate reset --force
```

---

## 6. Seed Data

### 6.1 Automatic Seed

Seed runs automatically when using `./start.sh` script.

### 6.2 Manual Seed

```bash
# Seed the database
docker compose exec backend npx prisma db seed

# Or skip seed by setting environment variable
SEED_DATA=false ./start.sh
```

### 6.3 Seeded Data

The seed creates:

| Entity | Count |
|--------|-------|
| Roles | 5 |
| Universities | 4 |
| Majors | 8 |
| Courses | 10 |
| Categories | 7 |
| Users | 5 |
| Books | 20 |
| Listings | 17 |
| Orders | 3 |
| Coupons | 2 |
| Reviews | 2 |

---

## 7. Access URLs

### Development Environment

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:3000 | NestJS REST API |
| Swagger Docs | http://localhost:3000/api/docs | API documentation |
| Health Check | http://localhost:3000/health | Health endpoint |

### Production Environment (Example)

| Service | URL |
|---------|-----|
| Frontend | https://www.sachgiare.vn |
| Backend API | https://api.sachgiare.vn |
| Swagger Docs | https://api.sachgiare.vn/api/docs |

---

## 8. Test Accounts

### Default Accounts (After Seed)

| Role | Email | Password | Balance |
|------|-------|----------|---------|
| Admin | admin@example.com | password123 | 1,000,000 VND |
| Moderator | moderator@example.com | password123 | 0 VND |
| Seller | seller@example.com | password123 | 500,000 VND |
| Buyer | buyer@example.com | password123 | 2,000,000 VND |
| Seller 2 | seller2@example.com | password123 | 300,000 VND |

### Admin Account (From .env)

| Field | Value (Default) |
|-------|-----------------|
| Email | admin@sachgiare.vn |
| Password | Admin123! |

---

## Quick Start (Under 10 Steps)

```bash
# 1. Clone repository
git clone <repo-url> && cd TMDT

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with secure passwords
nano .env

# 4. Start all services
docker compose up -d

# 5. Wait for services (about 2-3 minutes)
docker compose logs -f backend

# 6. Verify services are running
docker compose ps

# 7. Check frontend
open http://localhost:5173

# 8. Check API
curl http://localhost:3000/health

# 9. Login with test account
# Email: admin@example.com
# Password: password123
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U textbook -d textbook_marketplace
```

### Backend Not Starting

```bash
# Check backend logs
docker compose logs backend

# Rebuild backend
docker compose build backend
docker compose up -d backend
```

### Migration Failed

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# Reset and re-migrate
docker compose exec backend npx prisma migrate reset --force
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5173

# Change port in .env
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

---

## Docker Commands Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (RESETS DATA)
docker compose down -v

# Restart services
docker compose restart

# View logs
docker compose logs -f [service]

# Rebuild services
docker compose build --no-cache
docker compose up -d
```

---

## Database Backup

### Automated Backup

```bash
# Create backup directory
mkdir -p backups

# Run backup
./scripts/backup.sh

# View backups
ls -la backups/
```

### Manual Backup

```bash
# Backup with docker
docker compose exec -T postgres pg_dump -U textbook -d textbook_marketplace > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Restore database
./scripts/restore.sh backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `textbook` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `POSTGRES_DB` | Database name | `textbook_marketplace` |
| `DATABASE_URL` | Full connection string | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | `32+ char random` |
| `ADMIN_EMAIL` | Admin account email | `admin@sachgiare.vn` |
| `ADMIN_PASSWORD` | Admin password | `SecurePass123!` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `AWS_*` | S3 configuration | (empty) |

---

*Last Updated: 2026-09-25*
