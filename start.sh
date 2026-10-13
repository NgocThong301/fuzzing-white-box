#!/bin/bash
set -e

echo "🚀 Starting Textbook Marketplace..."

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment from .env"
    export $(grep -v '^#' .env | xargs)
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U ${POSTGRES_USER:-textbook} -d ${POSTGRES_DB:-textbook_marketplace} 2>/dev/null; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Run migrations
echo "🔄 Running database migrations..."
docker compose exec backend npx prisma migrate deploy

# Seed data (optional)
if [ "${SEED_DATA:-true}" = "true" ]; then
    echo "🌱 Seeding database..."
    docker compose exec backend npx prisma db seed
fi

# Start other services
echo "🚀 Starting backend and frontend..."
docker compose up -d backend frontend

echo ""
echo "✅ Startup complete!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-5173}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-3000}"
echo "   Swagger:  http://localhost:${BACKEND_PORT:-3000}/api/docs"
echo ""
echo "📧 Test accounts:"
echo "   admin@example.com / password123"
echo "   seller@example.com / password123"
echo "   buyer@example.com / password123"
echo ""
