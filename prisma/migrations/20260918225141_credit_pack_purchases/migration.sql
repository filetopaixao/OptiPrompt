-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bonusCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "credit_pack_purchases" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "amountPaidInCents" INTEGER NOT NULL,
    "creditsAdded" INTEGER NOT NULL,

    CONSTRAINT "credit_pack_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_pack_purchases_stripeSessionId_key" ON "credit_pack_purchases"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "credit_pack_purchases" ADD CONSTRAINT "credit_pack_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
