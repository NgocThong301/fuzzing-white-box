-- Migration: Add demo seed schema updates
-- Created: 2026-09-25
-- Purpose: Support demo data and demo-seed.ts script

-- Add ReviewStatus enum
DO $$ BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add DiscountType enum
DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add NotificationType values
DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'NEW_LISTING';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'NEW_REVIEW';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add reviews.status column
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'PENDING';

-- Add coupons.perUserLimit column
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "perUserLimit" INTEGER DEFAULT 1;

-- Add escrow_transactions dispute columns
ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "disputeReason" TEXT;
ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "resolvedBy" INTEGER;
ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP;
ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "resolutionNote" TEXT;
ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "heldAt" TIMESTAMP;

-- Add user reputation columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reputationScore" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalSales" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION DEFAULT 100;

-- Create indexes for reputation queries
CREATE INDEX IF NOT EXISTS "idx_users_reputation" ON "users"("reputationScore" DESC);
CREATE INDEX IF NOT EXISTS "idx_users_totalSales" ON "users"("totalSales" DESC);
