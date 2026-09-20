-- AlterTable
ALTER TABLE "users" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
