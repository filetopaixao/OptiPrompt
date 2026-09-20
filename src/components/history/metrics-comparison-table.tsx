import { ArrowDown, ArrowUp, CheckCircle2, Minus, XCircle } from "lucide-react";
import { CostImpactBadge } from "@/components/dashboard/cost-impact-badge";
import { formatBRLPrecise } from "@/lib/format-currency";
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

/** Traduz o salto bruto de tokens num múltiplo legível — sem isso, "22 → 892"
 * só é óbvio pra quem já sabe de cabeça que ~900 tokens é um artigo inteiro.
 * Ignora saltos pequenos (< 1.5x) pra não poluir a tabela com variações
 * triviais, e não calcula nada se um dos lados for 0 (não dá pra tirar
 * múltiplo de uma base zero). */
function tokenJumpCaption(before: number, after: number): string | null {
  if (before === 0 || after === 0) return null;
  const ratio = after / before;
  if (ratio >= 1.5) {
    const rounded = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10;
    return `~${rounded}x mais longa`;
  }
  if (ratio <= 1 / 1.5) {
    const inverse = 1 / ratio;
    const rounded = inverse >= 10 ? Math.round(inverse) : Math.round(inverse * 10) / 10;
    return `~${rounded}x mais curta`;
  }
  return null;
}

function RuleBadge({ verdict }: { verdict: "PASSED" | "FAILED" | null }) {
  if (verdict === null) return <span className="text-muted-foreground">—</span>;
  return verdict === "PASSED" ? (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="size-3.5" />
      Passou
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
      <XCircle className="size-3.5" />
      Falhou
    </span>
  );
}

export function MetricsComparisonTable({ resultsA, resultsB }: MetricsComparisonTableProps) {
  const modelIds = Array.from(
    new Set([...resultsA.map((r) => r.modelId), ...resultsB.map((r) => r.modelId)]),
  );
  const hasAnyRuleVerdict = [...resultsA, ...resultsB].some((r) => r.ruleVerdict !== null);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Modelo</th>
            {hasAnyRuleVerdict && (
              <>
                <th className="px-3 py-2 text-left font-medium">Regra A</th>
                <th className="px-3 py-2 text-left font-medium">Regra B</th>
              </>
            )}
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
            const jumpCaption =
              resultA && resultB ? tokenJumpCaption(tokensA, tokensB) : null;

            return (
              <tr key={modelId}>
                <td className="px-3 py-2 font-medium">{modelId}</td>
                {hasAnyRuleVerdict && (
                  <>
                    <td className="px-3 py-2">
                      {resultA ? <RuleBadge verdict={resultA.ruleVerdict} /> : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {resultB ? <RuleBadge verdict={resultB.ruleVerdict} /> : "—"}
                    </td>
                  </>
                )}
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
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        {tokensA} → {tokensB}
                        <DeltaIndicator before={tokensA} after={tokensB} />
                      </span>
                      {jumpCaption && (
                        <span className="text-xs text-muted-foreground">
                          Resposta ficou {jumpCaption}
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {resultA ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{formatBRLPrecise(resultA.estimatedCostInBRL)}</span>
                      <CostImpactBadge estimatedCostInCredits={resultA.estimatedCostInCredits} />
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {resultB ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{formatBRLPrecise(resultB.estimatedCostInBRL)}</span>
                      <CostImpactBadge estimatedCostInCredits={resultB.estimatedCostInCredits} />
                    </div>
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
