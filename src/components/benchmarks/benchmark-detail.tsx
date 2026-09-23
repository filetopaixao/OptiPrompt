"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileOutput, Loader2, Play, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getModelDefinition } from "@/types/models";
import type { BenchmarkDTO } from "@/types/benchmark";
import type { ModelId } from "@/types/models";
import {
  addBenchmarkCase,
  deleteBenchmark,
  removeBenchmarkCase,
  runBenchmarkAction,
  setBenchmarkBaseline,
  updateBenchmarkThresholds,
} from "@/app/app/benchmarks/actions";
import { BenchmarkRunDiff } from "./benchmark-run-diff";
import { BenchmarkRunResults } from "./benchmark-run-results";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function AddCaseDialog({ benchmarkId }: { benchmarkId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");

  function handleSubmit() {
    startTransition(async () => {
      const result = await addBenchmarkCase({
        benchmarkId,
        systemPrompt: systemPrompt || undefined,
        userMessage,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      setSystemPrompt("");
      setUserMessage("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus />
        Adicionar caso
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo caso de teste</DialogTitle>
          <DialogDescription>Mais um cenário real pra este benchmark comparar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Instruções do Sistema (Prompt)</Label>
            <Textarea
              className="min-h-20 resize-y"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Mensagem do Usuário</Label>
            <Textarea
              className="min-h-20 resize-y"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !userMessage.trim()}>
            Adicionar caso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ThresholdsForm({ benchmark }: { benchmark: BenchmarkDTO }) {
  const [isPending, startTransition] = useTransition();
  const [minQualityScore, setMinQualityScore] = useState(benchmark.minQualityScore?.toString() ?? "");
  const [maxQualityDropPoints, setMaxQualityDropPoints] = useState(
    benchmark.maxQualityDropPoints?.toString() ?? "",
  );
  const [maxCostIncreasePercent, setMaxCostIncreasePercent] = useState(
    benchmark.maxCostIncreasePercent?.toString() ?? "",
  );
  const [maxLatencyIncreasePercent, setMaxLatencyIncreasePercent] = useState(
    benchmark.maxLatencyIncreasePercent?.toString() ?? "",
  );
  const [criteria, setCriteria] = useState(benchmark.criteria.join(", "));

  function handleSave() {
    startTransition(async () => {
      const result = await updateBenchmarkThresholds({
        benchmarkId: benchmark.id,
        minQualityScore: minQualityScore ? Number(minQualityScore) : null,
        maxQualityDropPoints: maxQualityDropPoints ? Number(maxQualityDropPoints) : null,
        maxCostIncreasePercent: maxCostIncreasePercent ? Number(maxCostIncreasePercent) : null,
        maxLatencyIncreasePercent: maxLatencyIncreasePercent ? Number(maxLatencyIncreasePercent) : null,
        criteria: criteria
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      if (!result.ok) toast.error(result.error);
      else toast.success("Critérios salvos.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Critérios de aprovação</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Qualidade mínima (0-10)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={minQualityScore}
              onChange={(e) => setMinQualityScore(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Queda máx. de qualidade (pontos)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={maxQualityDropPoints}
              onChange={(e) => setMaxQualityDropPoints(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Aumento máx. de custo (%)</Label>
            <Input
              type="number"
              min={0}
              value={maxCostIncreasePercent}
              onChange={(e) => setMaxCostIncreasePercent(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Aumento máx. de latência (%)</Label>
            <Input
              type="number"
              min={0}
              value={maxLatencyIncreasePercent}
              onChange={(e) => setMaxLatencyIncreasePercent(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Critérios qualitativos (separados por vírgula)</Label>
          <Input value={criteria} onChange={(e) => setCriteria(e.target.value)} />
        </div>
        <div>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            Salvar critérios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BenchmarkDetail({
  benchmark,
  allowedModelIds,
}: {
  benchmark: BenchmarkDTO;
  allowedModelIds: ModelId[];
}) {
  const router = useRouter();
  const [isRunning, startRunTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const hasAllowedModels = benchmark.modelIds.some((id) => allowedModelIds.includes(id as ModelId));

  function handleRun() {
    startRunTransition(async () => {
      const result = await runBenchmarkAction(benchmark.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.partial) {
        toast.warning("Cota de crédito esgotou no meio da execução — resultados parciais salvos.");
      } else {
        toast.success("Benchmark executado.");
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteBenchmark(benchmark.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push("/app/benchmarks");
    });
  }

  function toggleCompare(runId: string) {
    setCompareIds((current) => {
      if (current.includes(runId)) return current.filter((id) => id !== runId);
      if (current.length >= 2) return [current[1], runId];
      return [...current, runId];
    });
  }

  const compareRuns = benchmark.runs.filter((run) => compareIds.includes(run.id));
  const baselineRun = benchmark.runs.find((run) => run.isBaseline);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/app/benchmarks" className="text-xs text-muted-foreground hover:underline">
            ← Benchmarks
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{benchmark.name}</h1>
          <p className="text-sm text-muted-foreground">
            {benchmark.projectName}
            {benchmark.description ? ` — ${benchmark.description}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRun} disabled={isRunning || !hasAllowedModels}>
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
            {isRunning ? "Executando…" : "Executar"}
          </Button>
          <Dialog>
            <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <Trash2 />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remover benchmark</DialogTitle>
                <DialogDescription>
                  Isso apaga <strong>{benchmark.name}</strong>, todos os casos e o histórico de
                  execuções. Não dá pra desfazer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  Remover
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!hasAllowedModels && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Nenhum dos modelos deste benchmark está disponível no seu plano atual.
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Casos de teste ({benchmark.cases.length})
          </CardTitle>
          <AddCaseDialog benchmarkId={benchmark.id} />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {benchmark.cases.map((benchmarkCase) => (
            <div key={benchmarkCase.id} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex-1">
                <p className="line-clamp-2 text-sm">{benchmarkCase.userMessage}</p>
              </div>
              <form
                action={async () => {
                  const result = await removeBenchmarkCase(benchmark.id, benchmarkCase.id);
                  if (!result.ok) toast.error(result.error);
                }}
              >
                <Button type="submit" variant="ghost" size="icon-sm">
                  <Trash2 />
                </Button>
              </form>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Modelos: {benchmark.modelIds.map((id) => getModelDefinition(id).label).join(", ")}
          </p>
        </CardContent>
      </Card>

      <ThresholdsForm benchmark={benchmark} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execuções ({benchmark.runs.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {benchmark.runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma execução ainda. Clique em &ldquo;Executar&rdquo; acima.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Selecione até 2 execuções pra comparar ({compareIds.length}/2).
              </p>
              <div className="flex flex-col gap-2">
                {benchmark.runs.map((run) => (
                  <div key={run.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(run.id)}
                          onChange={() => toggleCompare(run.id)}
                        />
                        <span className="font-medium">
                          {run.label || dateFormatter.format(new Date(run.createdAt))}
                        </span>
                        {run.isBaseline && <Badge variant="secondary">Baseline</Badge>}
                      </label>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          por {run.createdBy ? run.createdBy.name || run.createdBy.email : "conta removida"}{" "}
                          ·{" "}
                          {dateFormatter.format(new Date(run.createdAt))}
                        </span>
                        {!run.isBaseline && (
                          <form
                            action={async () => {
                              const result = await setBenchmarkBaseline(benchmark.id, run.id);
                              if (!result.ok) toast.error(result.error);
                              else toast.success("Baseline definida.");
                            }}
                          >
                            <Button type="submit" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs">
                              <Star className="size-3" />
                              Definir como baseline
                            </Button>
                          </form>
                        )}
                        <Link
                          href={`/report/benchmark/${run.id}`}
                          target="_blank"
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "h-6 gap-1 px-2 text-xs" })}
                        >
                          <FileOutput className="size-3" />
                          Relatório
                        </Link>
                      </div>
                    </div>
                    <details>
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Ver {run.results.length} resultado{run.results.length === 1 ? "" : "s"}
                      </summary>
                      <div className="mt-2">
                        <BenchmarkRunResults benchmarkId={benchmark.id} run={run} cases={benchmark.cases} />
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </>
          )}

          {compareRuns.length === 2 && (
            <BenchmarkRunDiff
              thresholds={{
                minQualityScore: benchmark.minQualityScore,
                maxQualityDropPoints: benchmark.maxQualityDropPoints,
                maxCostIncreasePercent: benchmark.maxCostIncreasePercent,
                maxLatencyIncreasePercent: benchmark.maxLatencyIncreasePercent,
              }}
              baselineRun={
                compareRuns.find((r) => r.id === baselineRun?.id) ??
                [...compareRuns].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
              }
              candidateRun={
                compareRuns.find((r) => r.id !== baselineRun?.id) ??
                [...compareRuns].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[1]
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
