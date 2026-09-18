"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
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

const DEFAULT_REQUESTS_PER_MONTH = 10_000;

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
}: {
  results: ExecutionResultDTO[];
  priority?: ComparisonPriority;
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

    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de latência</CardTitle>
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
              <Bar dataKey="latencyMs" fill="var(--color-latencyMs)" radius={4} />
            </BarChart>
          </ChartContainer>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Modelo</th>
                  <th className="px-3 py-2 text-left font-medium">Latência média</th>
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

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Projeção de custo em escala</CardTitle>
        <div className="flex items-center gap-2 print:hidden">
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
            <Bar dataKey="monthlyCostBRL" fill="var(--color-monthlyCostBRL)" radius={4} />
          </BarChart>
        </ChartContainer>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Modelo</th>
                <th className="px-3 py-2 text-left font-medium">Custo/requisição</th>
                <th className="px-3 py-2 text-left font-medium">Custo/mês projetado</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
