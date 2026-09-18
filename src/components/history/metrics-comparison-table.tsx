import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CostImpactBadge } from "@/components/dashboard/cost-impact-badge";
import type { ExecutionResultDTO } from "@/types/execution";
import { cn } from "@/lib/utils";

interface MetricsComparisonTableProps {
  resultsA: ExecutionResultDTO[];
  resultsB: ExecutionResultDTO[];
}

function DeltaIndicator({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  if (delta === 0) return <Minus className="size-3.5 text-muted-foreground" />;
  const isIncrease = delta > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium",
        isIncrease ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
      )}
    >
      {isIncrease ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
      {Math.abs(delta)}
    </span>
  );
}

export function MetricsComparisonTable({ resultsA, resultsB }: MetricsComparisonTableProps) {
  const modelIds = Array.from(
    new Set([...resultsA.map((r) => r.modelId), ...resultsB.map((r) => r.modelId)]),
  );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Modelo</th>
            <th className="px-3 py-2 text-left font-medium">Latência (A → B)</th>
            <th className="px-3 py-2 text-left font-medium">Tokens (A → B)</th>
            <th className="px-3 py-2 text-left font-medium">Custo A</th>
            <th className="px-3 py-2 text-left font-medium">Custo B</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {modelIds.map((modelId) => {
            const resultA = resultsA.find((r) => r.modelId === modelId);
            const resultB = resultsB.find((r) => r.modelId === modelId);
            const tokensA = resultA ? resultA.promptTokens + resultA.completionTokens : 0;
            const tokensB = resultB ? resultB.promptTokens + resultB.completionTokens : 0;

            return (
              <tr key={modelId}>
                <td className="px-3 py-2 font-medium">{modelId}</td>
                <td className="px-3 py-2">
                  {resultA && resultB ? (
                    <span className="flex items-center gap-2">
                      {resultA.latencyMs} ms → {resultB.latencyMs} ms
                      <DeltaIndicator before={resultA.latencyMs} after={resultB.latencyMs} />
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Somente em {resultA ? "A" : "B"}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {resultA && resultB ? (
                    <span className="flex items-center gap-2">
                      {tokensA} → {tokensB}
                      <DeltaIndicator before={tokensA} after={tokensB} />
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {resultA ? (
                    <CostImpactBadge estimatedCostInCredits={resultA.estimatedCostInCredits} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {resultB ? (
                    <CostImpactBadge estimatedCostInCredits={resultB.estimatedCostInCredits} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
