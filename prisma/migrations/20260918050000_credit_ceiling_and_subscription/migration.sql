-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INACTIVE');

-- AlterTable
-- monthlyCreditLimit vira valor derivado (20% do priceInCents do plano) —
-- ver getMonthlyCreditLimit em src/lib/credits/credit-converter.ts.
ALTER TABLE "plans" DROP COLUMN "monthlyCreditLimit";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");
