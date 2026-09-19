-- CreateEnum
CREATE TYPE "RuleVerdict" AS ENUM ('PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "executions" ADD COLUMN     "rule" TEXT;

-- AlterTable
ALTER TABLE "execution_results" ADD COLUMN     "ruleVerdict" "RuleVerdict",
ADD COLUMN     "ruleReason" TEXT;
