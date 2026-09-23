"use client";

import { useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock, Hash, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRLPrecise } from "@/lib/format-currency";
import { getModelDefinition } from "@/types/models";
import type { BenchmarkCaseDTO, BenchmarkRunDTO } from "@/types/benchmark";
import { setManualQualityScore } from "@/app/app/benchmarks/actions";

function QualityScoreInput({
  benchmarkId,
  resultId,
  value,
}: {
  benchmarkId: string;
  resultId: string;
  value: number | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const raw = event.target.value.trim();
    const score = raw === "" ? null : Number(raw);
    if (score !== null && (Number.isNaN(score) || score < 0 || score > 10)) {
      toast.error("Nota precisa estar entre 0 e 10.");
      return;
    }
    startTransition(async () => {
      const result = await setManualQualityScore(benchmarkId, resultId, score);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={`quality-${resultId}`} className="text-xs text-muted-foreground">
        Qualidade (0-10)
      </Label>
      <Input
        id={`quality-${resultId}`}
        type="number"
        min={0}
        max={10}
        step={0.5}
        defaultValue={value ?? ""}
        onBlur={handleBlur}
        disabled={isPending}
        className="h-7 w-16 text-xs"
      />
    </div>
  );
}

export function BenchmarkRunResults({
  benchmarkId,
  run,
  cases,
}: {
  benchmarkId: string;
  run: BenchmarkRunDTO;
  cases: BenchmarkCaseDTO[];
}) {
  const caseById = new Map(cases.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-3">
      {run.results.map((result) => {
        const benchmarkCase = caseById.get(result.benchmarkCaseId);
        return (
          <div key={result.id} className="rounded-lg border p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{getModelDefinition(result.modelId).label}</span>
                <Badge variant={result.tier === "PREMIUM" ? "default" : "secondary"}>
                  {result.tier === "PREMIUM" ? "Premium" : "Custo-benefício"}
                </Badge>
              </div>
              <QualityScoreInput
                benchmarkId={benchmarkId}
                resultId={result.id}
                value={result.manualQualityScore}
              />
            </div>
            {benchmarkCase && (
              <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
                Caso: {benchmarkCase.userMessage}
              </p>
            )}
            {result.status === "SUCCESS" ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.responseText}</p>
            ) : (
              <p className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {result.errorMessage ?? "Falha ao executar este modelo."}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {result.latencyMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Hash className="size-3.5" />
                {result.promptTokens + result.completionTokens} tokens
              </span>
              {result.status === "SUCCESS" && (
                <span className="font-medium text-foreground">
                  {formatBRLPrecise(result.costInBRL)}
                </span>
              )}
              {result.ruleVerdict && (
                <span className="flex items-center gap-1">
                  {result.ruleVerdict === "PASSED" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="size-3.5 text-destructive" />
                  )}
                  {result.ruleVerdict === "PASSED" ? "Regra: passou" : "Regra: falhou"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
