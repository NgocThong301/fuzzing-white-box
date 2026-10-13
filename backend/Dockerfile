# ===========================================
# Backend Dockerfile
# ===========================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# ===========================================
# Production stage
# ===========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install curl and openssl for healthcheck and Prisma
RUN apk add --no-cache curl openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for Passport)
RUN npm install --include=dev && npm cache clean --force

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client (needed for runtime)
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["sh", "-c", "npm run start:prod"]
