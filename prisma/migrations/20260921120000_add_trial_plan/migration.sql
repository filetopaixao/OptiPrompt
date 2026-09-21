-- AlterTable
ALTER TABLE "plans" ADD COLUMN "fixedMonthlyCreditLimit" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
