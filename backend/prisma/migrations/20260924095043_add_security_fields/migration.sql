-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lockUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3);
