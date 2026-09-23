-- DropForeignKey
ALTER TABLE "benchmark_runs" DROP CONSTRAINT "benchmark_runs_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "benchmarks" DROP CONSTRAINT "benchmarks_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "benchmark_runs" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "benchmarks" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
