import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ExecutionDTO } from "@/types/execution";
import { MetricsComparisonTable } from "./metrics-comparison-table";
import { PromptDiff } from "./prompt-diff";
import { ResponseComparison } from "./response-comparison";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function VersionComparePanel({
  executionA,
  executionB,
}: {
  executionA: ExecutionDTO;
  executionB: ExecutionDTO;
}) {
  const modelIdsA = new Set(executionA.results.map((r) => r.modelId));
  const modelIdsB = new Set(executionB.results.map((r) => r.modelId));
  const onlyInA = [...modelIdsA].filter((id) => !modelIdsB.has(id));
  const onlyInB = [...modelIdsB].filter((id) => !modelIdsA.has(id));
  const hasPartialModels = onlyInA.length > 0 || onlyInB.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-primary">Execução A</span>
          <p className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(executionA.createdAt))}
          </p>
        </div>
        <div>
          <span className="font-medium text-primary">Execução B</span>
          <p className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(executionB.createdAt))}
          </p>
        </div>
      </div>

      {hasPartialModels && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong>Comparação parcial</strong> — os modelos selecionados não são exatamente os
            mesmos nas duas execuções, então não dá pra saber como{" "}
            {onlyInA.length > 0 && <>{onlyInA.join(", ")} (só em A)</>}
            {onlyInA.length > 0 && onlyInB.length > 0 && " e "}
            {onlyInB.length > 0 && <>{onlyInB.join(", ")} (só em B)</>} teriam ido do outro lado.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-rose-200 dark:bg-rose-500/40" />
          removido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-500/40" />
          adicionado
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Instruções do Sistema (Prompt)</h3>
        <div className="rounded-md border bg-muted/30 p-3">
          <PromptDiff before={executionA.systemPrompt} after={executionB.systemPrompt} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Mensagem do Usuário</h3>
        <div className="rounded-md border bg-muted/30 p-3">
          <PromptDiff before={executionA.userMessage} after={executionB.userMessage} />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Performance e custo por modelo</h3>
        <MetricsComparisonTable resultsA={executionA.results} resultsB={executionB.results} />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Respostas geradas</h3>
        <ResponseComparison resultsA={executionA.results} resultsB={executionB.results} />
      </div>
    </div>
  );
}
