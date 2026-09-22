import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { planExecutionBudget } from "@/lib/ai/budget";
import { getAdapterForModel } from "@/lib/ai/adapters";
import { getUsageSummary, registerConsumption } from "@/lib/credits/usage-service";
import { prisma } from "@/lib/db/prisma";
import { ensureOpenRouterApiKey } from "@/lib/openrouter/client";
import { getAllowedModelIds } from "@/lib/plans/model-access";
import { findAccessibleWorkflow } from "@/lib/workflows/access";
import { topologicalOrder, transformWorkflowValue } from "@/lib/workflows/graph";
import { workflowGraphSchema } from "@/lib/workflows/schema";
import type { ModelId } from "@/types/models";
import type { WorkflowEdge, WorkflowNode } from "@/lib/workflows/types";

type Context = { params: Promise<{ workflowId: string }> };

export async function POST(_: Request, { params }: Context) {
  const userId = await getCurrentUserId();
  const { workflowId } = await params;
  const workflow = await findAccessibleWorkflow(workflowId, userId);
  if (!workflow) return NextResponse.json({ error: "Workflow não encontrado." }, { status: 404 });

  const parsed = workflowGraphSchema.safeParse({ name: workflow.name, nodes: workflow.nodes, edges: workflow.edges });
  if (!parsed.success) return NextResponse.json({ error: "O workflow salvo é inválido." }, { status: 400 });
  const nodes = parsed.data.nodes as WorkflowNode[];
  const edges = parsed.data.edges as WorkflowEdge[];
  let ordered: WorkflowNode[];
  try { ordered = topologicalOrder(nodes, edges); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Grafo inválido." }, { status: 400 }); }
  if (!nodes.some((node) => node.data.kind === "input") || !nodes.some((node) => node.data.kind === "output")) {
    return NextResponse.json({ error: "Adicione pelo menos um bloco de entrada e um de saída." }, { status: 400 });
  }

  const billingOwnerId = await getBillingOwnerId(userId);
  const [usage, billingOwner] = await Promise.all([
    getUsageSummary(billingOwnerId),
    prisma.user.findUniqueOrThrow({ where: { id: billingOwnerId }, select: { plan: { select: { slug: true } } } }),
  ]);
  if (usage.isOverLimit) return NextResponse.json({ error: "Sua cota mensal de uso foi atingida." }, { status: 403 });
  const allowed = new Set(getAllowedModelIds(billingOwner.plan?.slug));
  const llmNodes = nodes.filter((node) => node.data.kind === "llm");
  if (llmNodes.some((node) => !node.data.modelId || !allowed.has(node.data.modelId as ModelId))) {
    return NextResponse.json({ error: "O workflow usa um modelo indisponível no seu plano." }, { status: 403 });
  }

  const run = await prisma.workflowRun.create({
    data: { workflowId, status: "RUNNING", nodesSnapshot: parsed.data.nodes, edgesSnapshot: parsed.data.edges },
  });
  const apiKey = llmNodes.length ? await ensureOpenRouterApiKey(billingOwnerId) : "";
  const outputs = new Map<string, string>();
  let totalCredits = 0;
  let totalLatencyMs = 0;
  let activeNode: WorkflowNode | null = null;
  let activeInput = "";
  let activePosition = 0;

  try {
    for (const [position, node] of ordered.entries()) {
      const input = edges.filter((edge) => edge.target === node.id).map((edge) => outputs.get(edge.source) ?? "").filter(Boolean).join("\n\n");
      activeNode = node; activeInput = input; activePosition = position;
      let output = input;
      let metrics = { promptTokens: 0, completionTokens: 0, latencyMs: 0, estimatedCostInCredits: 0, estimatedCostInBRL: 0 };
      if (node.data.kind === "input") output = node.data.prompt;
      if (node.data.kind === "transform") output = transformWorkflowValue(input, node.data.prompt);
      if (node.data.kind === "llm") {
        const modelId = node.data.modelId as ModelId;
        const budget = await planExecutionBudget([modelId], node.data.prompt, input, Math.max(0, usage.creditsAvailable - totalCredits));
        if (!budget.ok) throw new Error(budget.reason);
        const result = await getAdapterForModel().execute({ modelId, systemPrompt: node.data.prompt, userMessage: input || "Execute a instrução.", maxOutputTokens: budget.plans[0]?.maxOutputTokens, apiKey });
        if (result.status === "ERROR") throw new Error(result.errorMessage ?? `Falha no bloco ${node.data.label}.`);
        output = result.responseText ?? "";
        metrics = { promptTokens: result.promptTokens, completionTokens: result.completionTokens, latencyMs: result.latencyMs, estimatedCostInCredits: result.estimatedCostInCredits, estimatedCostInBRL: result.estimatedCostInBRL };
        totalCredits += result.estimatedCostInCredits;
        totalLatencyMs += result.latencyMs;
      }
      outputs.set(node.id, output);
      await prisma.workflowStepRun.create({ data: { runId: run.id, nodeId: node.id, kind: node.data.kind, label: node.data.label, modelId: node.data.modelId || null, status: "SUCCESS", inputText: input || null, outputText: output || null, position, ...metrics } });
    }
    const finalOutput = ordered.filter((node) => node.data.kind === "output").map((node) => outputs.get(node.id) ?? "").join("\n\n");
    const completed = await prisma.workflowRun.update({ where: { id: run.id }, data: { status: "SUCCESS", finalOutput, totalCredits, totalLatencyMs, completedAt: new Date() }, include: { steps: { orderBy: { position: "asc" } } } });
    const updatedUsage = totalCredits > 0 ? await registerConsumption(billingOwnerId, totalCredits) : usage;
    return NextResponse.json({ run: completed, usage: updatedUsage }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível executar o workflow.";
    if (activeNode) await prisma.workflowStepRun.create({ data: { runId: run.id, nodeId: activeNode.id, kind: activeNode.data.kind, label: activeNode.data.label, modelId: activeNode.data.modelId || null, status: "ERROR", inputText: activeInput || null, errorMessage: message, position: activePosition } });
    if (totalCredits > 0) await registerConsumption(billingOwnerId, totalCredits);
    const failed = await prisma.workflowRun.update({ where: { id: run.id }, data: { status: "ERROR", errorMessage: message, totalCredits, totalLatencyMs, completedAt: new Date() }, include: { steps: { orderBy: { position: "asc" } } } });
    return NextResponse.json({ error: message, run: failed }, { status: 422 });
  }
}
