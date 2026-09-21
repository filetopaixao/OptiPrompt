import type { Execution, ExecutionResult, Prompt, Project, User } from "@prisma/client";
import type { ExecutionDTO } from "@/types/execution";

type ExecutionWithRelations = Execution & {
  prompt: Pick<Prompt, "name">;
  results: ExecutionResult[];
  /** Incluído em listExecutionsForProject e listExecutionsForTeam — ver
   * comentário em ExecutionDTO.executedBy. `project` só vem populado na
   * consulta de listExecutionsForTeam (ver ExecutionDTO.project). */
  user?: Pick<User, "id" | "name" | "email"> & {
    project?: Pick<Project, "id" | "name"> | null;
  };
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
    rule: execution.rule,
    executedBy: execution.user
      ? { id: execution.user.id, name: execution.user.name, email: execution.user.email }
      : undefined,
    project: execution.user?.project
      ? { id: execution.user.project.id, name: execution.user.project.name }
      : undefined,
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
      ruleVerdict: result.ruleVerdict,
      ruleReason: result.ruleReason,
    })),
  };
}
