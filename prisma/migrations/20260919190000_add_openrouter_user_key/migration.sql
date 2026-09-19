-- AlterTable
ALTER TABLE "users" ADD COLUMN     "openRouterApiKey" TEXT,
ADD COLUMN     "openRouterKeyHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_openRouterKeyHash_key" ON "users"("openRouterKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "users_openRouterApiKey_key" ON "users"("openRouterApiKey");
