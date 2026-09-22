CREATE TABLE "workflow_projects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nodes" JSONB NOT NULL,
  "edges" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "projectId" TEXT,
  CONSTRAINT "workflow_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workflow_runs" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "nodesSnapshot" JSONB NOT NULL,
  "edgesSnapshot" JSONB NOT NULL,
  "finalOutput" TEXT,
  "errorMessage" TEXT,
  "totalCredits" INTEGER NOT NULL DEFAULT 0,
  "totalLatencyMs" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "workflowId" TEXT NOT NULL,
  CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workflow_step_runs" (
  "id" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "modelId" TEXT,
  "status" TEXT NOT NULL,
  "inputText" TEXT,
  "outputText" TEXT,
  "errorMessage" TEXT,
  "promptTokens" INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "latencyMs" INTEGER NOT NULL DEFAULT 0,
  "estimatedCostInCredits" INTEGER NOT NULL DEFAULT 0,
  "estimatedCostInBRL" DECIMAL(10,6) NOT NULL DEFAULT 0,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "runId" TEXT NOT NULL,
  CONSTRAINT "workflow_step_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "workflow_projects_userId_updatedAt_idx" ON "workflow_projects"("userId", "updatedAt");
CREATE INDEX "workflow_projects_projectId_updatedAt_idx" ON "workflow_projects"("projectId", "updatedAt");
CREATE INDEX "workflow_runs_workflowId_createdAt_idx" ON "workflow_runs"("workflowId", "createdAt");
CREATE INDEX "workflow_step_runs_runId_position_idx" ON "workflow_step_runs"("runId", "position");
ALTER TABLE "workflow_projects" ADD CONSTRAINT "workflow_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_projects" ADD CONSTRAINT "workflow_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_step_runs" ADD CONSTRAINT "workflow_step_runs_runId_fkey" FOREIGN KEY ("runId") REFERENCES "workflow_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
