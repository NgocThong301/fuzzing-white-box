-- Migration: Add seller reputation fields
-- Created: 2026-09-25

-- Add reputation fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reputationScore" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalSales" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION DEFAULT 100;

-- Add index for reputation queries
CREATE INDEX IF NOT EXISTS "idx_users_reputation" ON "users"("reputationScore" DESC);
CREATE INDEX IF NOT EXISTS "idx_users_totalSales" ON "users"("totalSales" DESC);
