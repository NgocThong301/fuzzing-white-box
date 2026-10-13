#!/bin/bash
#
# Clean Install Test Script
# This script tests a fresh installation from scratch
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "   Clean Install Test Script"
echo "   Textbook Marketplace"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_success() {
    if [ $? -eq 0 ]; then
        log_info "$1"
    else
        log_error "$1"
        exit 1
    fi
}

# Step 1: Clean up existing containers and volumes
log_info "Step 1: Cleaning up existing containers and volumes..."
docker compose down -v 2>/dev/null || true
check_success "Cleaned up existing containers"

# Step 2: Create .env file
log_info "Step 2: Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    check_success "Created .env from template"
else
    log_warn ".env already exists, skipping..."
fi

# Step 3: Pull latest images
log_info "Step 3: Pulling Docker images..."
docker compose pull
check_success "Pulled Docker images"

# Step 4: Build images
log_info "Step 4: Building Docker images..."
docker compose build --no-cache
check_success "Built Docker images"

# Step 5: Start services
log_info "Step 5: Starting services..."
docker compose up -d
check_success "Started services"

# Step 6: Wait for database
log_info "Step 6: Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U textbook 2>/dev/null; then
        log_info "PostgreSQL is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Step 7: Wait for backend
log_info "Step 7: Waiting for backend to be ready..."
for i in {1..60}; do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        log_info "Backend is ready!"
        break
    fi
    echo "   Waiting... ($i/60)"
    sleep 3
done

# Step 8: Check all services
log_info "Step 8: Checking services..."
docker compose ps

# Step 9: Test health endpoints
log_info "Step 9: Testing health endpoints..."

echo "   Testing backend health..."
HEALTH_STATUS=$(curl -sf http://localhost:3000/health || echo "FAILED")
if [ "$HEALTH_STATUS" != "FAILED" ]; then
    log_info "Backend health: OK"
else
    log_error "Backend health: FAILED"
fi

echo "   Testing frontend..."
HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "FAILED")
if [ "$HTTP_STATUS" = "200" ]; then
    log_info "Frontend: OK (HTTP $HTTP_STATUS)"
else
    log_error "Frontend: FAILED (HTTP $HTTP_STATUS)"
fi

# Step 10: Test API
log_info "Step 10: Testing API endpoints..."

echo "   Testing categories..."
CATEGORIES=$(curl -sf http://localhost:3000/api/categories || echo "FAILED")
if [ "$CATEGORIES" != "FAILED" ]; then
    log_info "Categories API: OK"
else
    log_error "Categories API: FAILED"
fi

echo "   Testing listings..."
LISTINGS=$(curl -sf http://localhost:3000/api/listings || echo "FAILED")
if [ "$LISTINGS" != "FAILED" ]; then
    log_info "Listings API: OK"
else
    log_error "Listings API: FAILED"
fi

# Step 11: Summary
echo ""
echo "=================================================="
echo "   Installation Test Complete"
echo "=================================================="
echo ""
echo "📍 URLs:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   Swagger:   http://localhost:3000/api/docs"
echo ""
echo "📧 Test Accounts:"
echo "   admin@example.com / password123"
echo "   buyer@example.com / password123"
echo "   seller@example.com / password123"
echo ""
echo "To stop:"
echo "   docker compose down"
echo ""
echo "To clean everything:"
echo "   docker compose down -v"
echo ""
