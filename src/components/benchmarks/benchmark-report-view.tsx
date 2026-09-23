"use client";

import Image from "next/image";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportLogo } from "@/components/report/report-logo";
import { formatBRLPrecise } from "@/lib/format-currency";
import { getModelDefinition } from "@/types/models";
import type { BenchmarkRunDTO } from "@/types/benchmark";
import type { BenchmarkRunReportData } from "@/lib/benchmarks/get-run-report";
import { BenchmarkRunDiff } from "./benchmark-run-diff";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

export function BenchmarkReportView({
  data,
  allowWhitelabelLogo,
}: {
  data: BenchmarkRunReportData;
  allowWhitelabelLogo: boolean;
}) {
  const { run, benchmarkName, benchmarkDescription, projectName, cases, baselineRun, thresholds } = data;

  const successResults = run.results.filter((r) => r.status === "SUCCESS");
  const totalCostInBRL = successResults.reduce((sum, r) => sum + r.costInBRL, 0);
  const costPerCase = cases.length > 0 ? totalCostInBRL / cases.length : 0;
  const avgLatencyMs =
    successResults.length > 0
      ? Math.round(successResults.reduce((sum, r) => sum + r.latencyMs, 0) / successResults.length)
      : 0;

  const modelIds = Array.from(new Set(run.results.map((r) => r.modelId)));
  const winnerModelId = pickWinnerModelId(run);

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10 print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <header className="mb-8 flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Image src="/logo-icon.png" alt="" width={16} height={16} />
            OtimizaIA — Relatório de avaliação de benchmark
          </div>
          <h1 className="mt-1 text-xl font-semibold">{benchmarkName}</h1>
          <p className="text-sm text-muted-foreground">
            {projectName} · {dateFormatter.format(new Date(run.createdAt))} · run {run.id.slice(0, 8)}
          </p>
          {benchmarkDescription && <p className="mt-1 text-sm">{benchmarkDescription}</p>}
        </div>
        {allowWhitelabelLogo && <ReportLogo />}
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Casos testados</p>
          <p className="text-xl font-semibold">{cases.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Custo total</p>
          <p className="text-xl font-semibold">{formatBRLPrecise(totalCostInBRL)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Custo por caso</p>
          <p className="text-xl font-semibold">{formatBRLPrecise(costPerCase)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Latência média</p>
          <p className="text-xl font-semibold">{avgLatencyMs}ms</p>
        </div>
      </section>

      {winnerModelId && (
        <section className="mb-8 rounded-lg border border-emerald-500/40 bg-emerald-50/30 p-4 dark:bg-emerald-500/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Modelo recomendado
          </p>
          <p className="mt-1 text-lg font-semibold">{getModelDefinition(winnerModelId).label}</p>
          <p className="text-sm text-muted-foreground">
            Menor custo médio entre os modelos testados que tiveram sucesso em todos os casos.
          </p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Modelos testados
        </h2>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Modelo</th>
                <th className="px-3 py-2 text-left font-medium">Sucesso</th>
                <th className="px-3 py-2 text-left font-medium">Custo médio</th>
                <th className="px-3 py-2 text-left font-medium">Latência média</th>
                <th className="px-3 py-2 text-left font-medium">Qualidade média</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modelIds.map((modelId) => {
                const modelResults = run.results.filter((r) => r.modelId === modelId);
                const success = modelResults.filter((r) => r.status === "SUCCESS");
                const avgCost = average(success.map((r) => r.costInBRL));
                const avgLatency = average(success.map((r) => r.latencyMs));
                const qualityScores = success
                  .map((r) => r.manualQualityScore)
                  .filter((s): s is number => s !== null);
                const avgQuality = average(qualityScores);
                return (
                  <tr key={modelId} className={modelId === winnerModelId ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}>
                    <td className="px-3 py-2 font-medium">{getModelDefinition(modelId).label}</td>
                    <td className="px-3 py-2">
                      {success.length}/{modelResults.length}
                    </td>
                    <td className="px-3 py-2">{avgCost !== null ? formatBRLPrecise(avgCost) : "—"}</td>
                    <td className="px-3 py-2">{avgLatency !== null ? `${Math.round(avgLatency)}ms` : "—"}</td>
                    <td className="px-3 py-2">{avgQuality !== null ? avgQuality.toFixed(1) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {baselineRun && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Comparação com a baseline
          </h2>
          <BenchmarkRunDiff thresholds={thresholds} baselineRun={baselineRun} candidateRun={run} />
        </section>
      )}

      <footer className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
        Relatório de avaliação gerado por OtimizaIA — otimizaia.app. Não é um selo de certificação;
        reflete os casos e critérios definidos neste benchmark.
      </footer>
    </div>
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Vencedor simples pro relatório: menor custo médio entre os modelos que
 * tiveram 100% de sucesso nos casos — um modelo que falhou em algum caso
 * não pode ser "recomendado" mesmo que seja barato nos que funcionaram. */
function pickWinnerModelId(run: BenchmarkRunDTO): string | null {
  const modelIds = Array.from(new Set(run.results.map((r) => r.modelId)));
  const fullySuccessful = modelIds.filter((modelId) => {
    const modelResults = run.results.filter((r) => r.modelId === modelId);
    return modelResults.length > 0 && modelResults.every((r) => r.status === "SUCCESS");
  });
  if (fullySuccessful.length === 0) return null;

  return fullySuccessful.reduce((cheapest, modelId) => {
    const cost = average(run.results.filter((r) => r.modelId === modelId).map((r) => r.costInBRL)) ?? Infinity;
    const cheapestCost =
      average(run.results.filter((r) => r.modelId === cheapest).map((r) => r.costInBRL)) ?? Infinity;
    return cost < cheapestCost ? modelId : cheapest;
  });
}
