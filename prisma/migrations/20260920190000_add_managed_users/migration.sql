-- AlterTable
ALTER TABLE "users" ADD COLUMN "managedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managedByUserId_fkey" FOREIGN KEY ("managedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
