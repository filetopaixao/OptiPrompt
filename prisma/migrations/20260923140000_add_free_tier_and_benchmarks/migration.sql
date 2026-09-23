-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "freeExecutionUsedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_tier_models" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "free_tier_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_execution_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelIds" TEXT[],
    "succeeded" BOOLEAN NOT NULL,
    "providerErrorOccurred" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_execution_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmarks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "taskType" TEXT,
    "criteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minQualityScore" INTEGER,
    "maxQualityDropPoints" INTEGER,
    "maxCostIncreasePercent" INTEGER,
    "maxLatencyIncreasePercent" INTEGER,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_cases" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "userMessage" TEXT NOT NULL,
    "attachedImageDataUrl" TEXT,
    "expectedWinnerModelId" TEXT,
    "expectedResponse" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAnonymized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_models" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_runs" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "label" TEXT,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_results" (
    "id" TEXT NOT NULL,
    "benchmarkRunId" TEXT NOT NULL,
    "benchmarkCaseId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "modelId" TEXT NOT NULL,
    "tier" "ModelTier" NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'SUCCESS',
    "responseText" TEXT,
    "errorMessage" TEXT,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "costInBRL" DECIMAL(10,6) NOT NULL,
    "costInCredits" INTEGER NOT NULL,
    "manualQualityScore" INTEGER,
    "ruleVerdict" "RuleVerdict",
    "ruleReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "free_tier_models_modelId_key" ON "free_tier_models"("modelId");

-- CreateIndex
CREATE INDEX "free_execution_attempts_userId_idx" ON "free_execution_attempts"("userId");

-- CreateIndex
CREATE INDEX "product_events_name_idx" ON "product_events"("name");

-- CreateIndex
CREATE INDEX "product_events_userId_idx" ON "product_events"("userId");

-- CreateIndex
CREATE INDEX "benchmarks_projectId_idx" ON "benchmarks"("projectId");

-- CreateIndex
CREATE INDEX "benchmark_cases_benchmarkId_idx" ON "benchmark_cases"("benchmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_models_benchmarkId_modelId_key" ON "benchmark_models"("benchmarkId", "modelId");

-- CreateIndex
CREATE INDEX "benchmark_runs_benchmarkId_idx" ON "benchmark_runs"("benchmarkId");

-- CreateIndex
CREATE INDEX "benchmark_results_benchmarkRunId_idx" ON "benchmark_results"("benchmarkRunId");

-- CreateIndex
CREATE INDEX "benchmark_results_benchmarkCaseId_idx" ON "benchmark_results"("benchmarkCaseId");

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_execution_attempts" ADD CONSTRAINT "free_execution_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_events" ADD CONSTRAINT "product_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_cases" ADD CONSTRAINT "benchmark_cases_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_models" ADD CONSTRAINT "benchmark_models_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_runs" ADD CONSTRAINT "benchmark_runs_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "benchmark_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_benchmarkCaseId_fkey" FOREIGN KEY ("benchmarkCaseId") REFERENCES "benchmark_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
