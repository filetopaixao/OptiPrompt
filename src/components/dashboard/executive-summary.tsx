"use client";

import { Gauge, Trophy, Wallet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRLPrecise } from "@/lib/format-currency";
import { computeWinner, type ComparisonPriority } from "@/lib/executions/insights";
import { getModelDefinition } from "@/types/models";
import type { ExecutionResultDTO } from "@/types/execution";

/**
 * Painel de veredicto: em vez de deixar o cliente da agência interpretar os
 * cards um a um, já anuncia o modelo vencedor e o ganho percentual —
 * resumo executivo "mastigado" para quem vai decidir, não implementar.
 *
 * `priority` é controlado pelo pai (DashboardWorkspace) — o gráfico de
 * projeção ao lado (CostProjection) reage ao mesmo critério.
 */
export function ExecutiveSummary({
  results,
  priority,
  onPriorityChange,
}: {
  results: ExecutionResultDTO[];
  priority: ComparisonPriority;
  onPriorityChange: (priority: ComparisonPriority) => void;
}) {
  const insight = computeWinner(results, priority);
  if (!insight) return null;

  const { winner, runnerUp, percentGain } = insight;
  const winnerLabel = getModelDefinition(winner.modelId).label;
  const runnerUpLabel = getModelDefinition(runnerUp.modelId).label;

  const verdictSentence =
    priority === "speed"
      ? `${winnerLabel} respondeu ${percentGain}% mais rápido do que ${runnerUpLabel} neste teste.`
      : `${winnerLabel} custou ${percentGain}% menos do que ${runnerUpLabel} neste teste.`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50/30 p-4 ring-1 ring-emerald-500/50 sm:flex-row sm:items-center sm:justify-between dark:bg-emerald-500/10">
      <div className="flex items-start gap-3">
        <Trophy className="mt-0.5 size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Modelo vencedor
          </p>
          <p className="text-lg font-semibold">{winnerLabel}</p>
          <p className="text-sm text-muted-foreground">{verdictSentence}</p>
          {priority === "price" && (
            <p className="text-xs text-muted-foreground">
              {formatBRLPrecise(winner.estimatedCostInBRL)} vs. {formatBRLPrecise(runnerUp.estimatedCostInBRL)} por
              requisição
            </p>
          )}
        </div>
      </div>

      <Tabs value={priority} onValueChange={(value) => onPriorityChange(value as ComparisonPriority)}>
        <TabsList>
          <TabsTrigger value="price">
            <Wallet className="size-4" />
            Preço
          </TabsTrigger>
          <TabsTrigger value="speed">
            <Gauge className="size-4" />
            Velocidade
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
