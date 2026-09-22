"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatBRL, formatBRLPrecise } from "@/lib/format-currency";
import {
  buildLatencyComparison,
  computeWinner,
  projectMonthlyCost,
  type ComparisonPriority,
} from "@/lib/executions/insights";
import { getModelDefinition } from "@/types/models";
import type { ExecutionResultDTO } from "@/types/execution";

/** Selo compacto de veredito da regra pra colocar ao lado do custo/latência
 * nas tabelas — mesma semântica do badge dos cards de resultado, mas sem
 * texto, já que aqui a coluna "Modelo" ao lado já identifica de quem é. */
function RuleVerdictCell({ ruleVerdict }: { ruleVerdict: ExecutionResultDTO["ruleVerdict"] }) {
  if (!ruleVerdict) return <span className="text-muted-foreground">—</span>;

  return ruleVerdict === "PASSED" ? (
    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="size-3.5" />
      Passou
    </span>
  ) : (
    <span className="flex items-center gap-1 text-destructive">
      <XCircle className="size-3.5" />
      Falhou
    </span>
  );
}

const DEFAULT_REQUESTS_PER_MONTH = 10_000;

/** Cor de destaque do vencedor (menor custo/latência) vs. o resto das barras
 * — hardcoded em vez de token de tema porque o preenchimento SVG do
 * recharts não lê variáveis de cor por Cell de forma confiável entre temas. */
const WINNER_BAR_COLOR = "#10b981"; // emerald-500
const OTHER_BAR_COLOR = "#cbd5e1"; // slate-300

const costChartConfig = {
  monthlyCostBRL: { label: "Custo mensal projetado", color: "var(--chart-1)" },
} satisfies ChartConfig;

const latencyChartConfig = {
  latencyMs: { label: "Latência média", color: "var(--chart-1)" },
} satisfies ChartConfig;

/**
 * Simulador de escala/velocidade — controlado pelo mesmo toggle do
 * ExecutiveSummary (DashboardWorkspace): "price" projeta o custo por
 * requisição num volume mensal; "speed" troca para uma comparação direta
 * de latência entre modelos, sem depender de volume.
 */
export function CostProjection({
  results,
  priority = "price",
  headerActions,
}: {
  results: ExecutionResultDTO[];
  priority?: ComparisonPriority;
  /** Ações extras (ex: botão de exportar relatório) renderizadas no mesmo
   * nível do título do card, alinhadas à direita — evita que fiquem
   * "soltas" no layout entre os componentes. */
  headerActions?: ReactNode;
}) {
  const [requestsPerMonth, setRequestsPerMonth] = useState(DEFAULT_REQUESTS_PER_MONTH);

  const costRows = useMemo(
    () => projectMonthlyCost(results, requestsPerMonth),
    [results, requestsPerMonth],
  );
  const latencyRows = useMemo(() => buildLatencyComparison(results), [results]);

  if (priority === "speed") {
    if (latencyRows.length < 2) return null;

    const speedInsight = computeWinner(results, "speed");
    const fastest = latencyRows[0];
    const chartData = latencyRows.map((row) => ({
      modelId: getModelDefinition(row.modelId).label,
      latencyMs: row.latencyMs,
    }));
    const hasRuleData = latencyRows.some((row) => row.ruleVerdict !== null);

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Comparação de latência</CardTitle>
          {headerActions && <div className="print:hidden">{headerActions}</div>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {speedInsight && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                {getModelDefinition(speedInsight.winner.modelId).label}
              </strong>{" "}
              respondeu {speedInsight.percentGain}% mais rápido do que{" "}
              {getModelDefinition(speedInsight.runnerUp.modelId).label} neste teste.
            </p>
          )}

          <ChartContainer config={latencyChartConfig} className="h-56 w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `${value}ms`} fontSize={12} />
              <YAxis type="category" dataKey="modelId" width={110} fontSize={12} />
              <Tooltip content={<ChartTooltipContent formatter={(value) => `${value}ms`} />} />
              <Bar dataKey="latencyMs" radius={4}>
                {latencyRows.map((row) => (
                  <Cell
                    key={row.modelId}
                    fill={row.modelId === fastest.modelId ? WINNER_BAR_COLOR : OTHER_BAR_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Modelo</th>
                  <th className="px-3 py-2 text-left font-medium">Latência média</th>
                  {hasRuleData && <th className="px-3 py-2 text-left font-medium">Regra</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {latencyRows.map((row) => (
                  <tr
                    key={row.modelId}
                    className={row.modelId === fastest.modelId ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}
                  >
                    <td className="px-3 py-2 font-medium">{getModelDefinition(row.modelId).label}</td>
                    <td className="px-3 py-2">{row.latencyMs}ms</td>
                    {hasRuleData && (
                      <td className="px-3 py-2">
                        <RuleVerdictCell ruleVerdict={row.ruleVerdict} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (costRows.length < 2) return null;

  const chartData = costRows.map((row) => ({
    modelId: getModelDefinition(row.modelId).label,
    monthlyCostBRL: Number(row.monthlyCostBRL.toFixed(2)),
  }));

  const cheapest = costRows[0];
  const mostExpensive = costRows[costRows.length - 1];
  const savings = mostExpensive.monthlyCostBRL - cheapest.monthlyCostBRL;
  const hasRuleData = costRows.some((row) => row.ruleVerdict !== null);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Projeção de custo em escala</CardTitle>
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Label htmlFor="requests-per-month" className="text-xs text-muted-foreground">
              Requisições/mês
            </Label>
            <Input
              id="requests-per-month"
              type="number"
              min={1}
              step={1000}
              value={requestsPerMonth}
              onChange={(event) => setRequestsPerMonth(Math.max(1, Number(event.target.value) || 1))}
              className="w-28"
            />
          </div>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {savings > 0 && (
          <p className="text-sm text-muted-foreground">
            Rodando <strong>{requestsPerMonth.toLocaleString("pt-BR")}</strong> requisições/mês, escolher{" "}
            <strong className="text-foreground">{getModelDefinition(cheapest.modelId).label}</strong> em vez de{" "}
            {getModelDefinition(mostExpensive.modelId).label} economiza{" "}
            <strong className="text-foreground">{formatBRL(savings)}/mês</strong>.
          </p>
        )}

        <ChartContainer config={costChartConfig} className="h-56 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickFormatter={(value) => formatBRL(value)} fontSize={12} />
            <YAxis type="category" dataKey="modelId" width={110} fontSize={12} />
            <Tooltip
              content={<ChartTooltipContent formatter={(value) => formatBRL(Number(value))} />}
            />
            <Bar dataKey="monthlyCostBRL" radius={4}>
              {costRows.map((row) => (
                <Cell
                  key={row.modelId}
                  fill={row.modelId === cheapest.modelId ? WINNER_BAR_COLOR : OTHER_BAR_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Modelo</th>
                <th className="px-3 py-2 text-left font-medium">Custo/requisição</th>
                <th className="px-3 py-2 text-left font-medium">Custo/mês projetado</th>
                {hasRuleData && <th className="px-3 py-2 text-left font-medium">Regra</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {costRows.map((row) => (
                <tr
                  key={row.modelId}
                  className={row.modelId === cheapest.modelId ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}
                >
                  <td className="px-3 py-2 font-medium">{getModelDefinition(row.modelId).label}</td>
                  <td className="px-3 py-2">{formatBRLPrecise(row.costPerRequestBRL)}</td>
                  <td className="px-3 py-2 font-medium">{formatBRL(row.monthlyCostBRL)}</td>
                  {hasRuleData && (
                    <td className="px-3 py-2">
                      <RuleVerdictCell ruleVerdict={row.ruleVerdict} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
