-- CreateEnum
CREATE TYPE "CreditProvider" AS ENUM ('ANTHROPIC', 'MARITACA');

-- CreateEnum
CREATE TYPE "CreditAllocationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "provider_credit_allocations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "amountPaidInCents" INTEGER NOT NULL,
    "provider" "CreditProvider" NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" "CreditAllocationStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "provider_credit_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_credit_allocations_stripeEventId_key" ON "provider_credit_allocations"("stripeEventId");

-- CreateIndex
CREATE INDEX "provider_credit_allocations_status_idx" ON "provider_credit_allocations"("status");

-- AddForeignKey
ALTER TABLE "provider_credit_allocations" ADD CONSTRAINT "provider_credit_allocations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
