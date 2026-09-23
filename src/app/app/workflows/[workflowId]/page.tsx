import { notFound } from "next/navigation";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";
import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getMostUsedModelIds } from "@/lib/executions/most-used-models";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import { findAccessibleWorkflow } from "@/lib/workflows/access";
import type { WorkflowProjectDTO } from "@/lib/workflows/types";

export const dynamic = "force-dynamic";

export default async function WorkflowPage({ params }: PageProps<"/app/workflows/[workflowId]">) {
  const userId = await getCurrentUserId();
  const { workflowId } = await params;
  if (!(await findAccessibleWorkflow(workflowId, userId))) notFound();
  const billingOwnerId = await getBillingOwnerId(userId);
  const [workflow, billingOwner, testedModelIds] = await Promise.all([
    prisma.workflowProject.findUnique({ where: { id: workflowId }, include: { runs: { take: 30, orderBy: { createdAt: "desc" }, include: { steps: { orderBy: { position: "asc" } } } } } }),
    prisma.user.findUniqueOrThrow({ where: { id: billingOwnerId }, select: { plan: { select: { slug: true } } } }),
    getMostUsedModelIds(userId),
  ]);
  if (!workflow) notFound();
  const serialized: WorkflowProjectDTO = {
    id: workflow.id, name: workflow.name, nodes: workflow.nodes as unknown as WorkflowProjectDTO["nodes"], edges: workflow.edges as unknown as WorkflowProjectDTO["edges"], projectId: workflow.projectId,
    createdAt: workflow.createdAt.toISOString(), updatedAt: workflow.updatedAt.toISOString(),
    runs: workflow.runs.map((run) => ({ id: run.id, status: run.status, finalOutput: run.finalOutput, errorMessage: run.errorMessage, totalCredits: run.totalCredits, totalLatencyMs: run.totalLatencyMs, createdAt: run.createdAt.toISOString(), completedAt: run.completedAt?.toISOString() ?? null, steps: run.steps.map((step) => ({ id: step.id, nodeId: step.nodeId, kind: step.kind, label: step.label, modelId: step.modelId, status: step.status, inputText: step.inputText, outputText: step.outputText, errorMessage: step.errorMessage, promptTokens: step.promptTokens, completionTokens: step.completionTokens, latencyMs: step.latencyMs, estimatedCostInCredits: step.estimatedCostInCredits })) })),
  };
  const allowedModelIds = await getAllowedModelIds(billingOwner.plan?.slug);
  const testedModels = new Set(testedModelIds);
  const rankedModelIds = [...allowedModelIds].sort((a, b) => Number(testedModels.has(b)) - Number(testedModels.has(a)));
  return <WorkflowEditor initialWorkflow={serialized} allowedModelIds={rankedModelIds} testedModelIds={testedModelIds} />;
}
