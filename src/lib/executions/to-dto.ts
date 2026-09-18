import type { Execution, ExecutionResult, Prompt } from "@prisma/client";
import type { ExecutionDTO } from "@/types/execution";

type ExecutionWithRelations = Execution & {
  prompt: Pick<Prompt, "name">;
  results: ExecutionResult[];
};

/** Mapeia as entidades do Prisma para o DTO exposto pela API. */
export function toExecutionDTO(execution: ExecutionWithRelations): ExecutionDTO {
  return {
    id: execution.id,
    createdAt: execution.createdAt.toISOString(),
    promptId: execution.promptId,
    promptName: execution.prompt.name,
    systemPrompt: execution.systemPrompt,
    userMessage: execution.userMessage,
    results: execution.results.map((result) => ({
      id: result.id,
      modelId: result.modelId,
      provider: result.provider,
      tier: result.tier,
      status: result.status,
      responseText: result.responseText,
      errorMessage: result.errorMessage,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      latencyMs: result.latencyMs,
      estimatedCostInCredits: result.estimatedCostInCredits,
      estimatedCostInBRL: Number(result.estimatedCostInBRL),
    })),
  };
}
