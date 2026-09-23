import { CheckCircle2, TriangleAlert, XCircle } from "lucide-react";
import { compareBenchmarkRuns, type BenchmarkThresholds } from "@/lib/benchmarks/diff";
import type { BenchmarkRunDTO } from "@/types/benchmark";
import { cn } from "@/lib/utils";

const VERDICT_STYLES = {
  APROVADO: {
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
    label: "APROVADO",
  },
  ATENCAO: {
    icon: TriangleAlert,
    className: "border-amber-400/50 bg-amber-50/40 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200",
    label: "ATENÇÃO",
  },
  REPROVADO: {
    icon: XCircle,
    className: "border-destructive/40 bg-destructive/5 text-destructive",
    label: "REPROVADO",
  },
} as const;

/** Compara duas BenchmarkRun (base vs. candidata) contra os limites do
 * benchmark — reaproveita a mesma lógica pura testada em diff.test.ts,
 * só monta a visualização em cima do resultado. */
export function BenchmarkRunDiff({
  thresholds,
  baselineRun,
  candidateRun,
}: {
  thresholds: BenchmarkThresholds;
  baselineRun: BenchmarkRunDTO;
  candidateRun: BenchmarkRunDTO;
}) {
  const diff = compareBenchmarkRuns(baselineRun.results, candidateRun.results, thresholds);

  const style = VERDICT_STYLES[diff.verdict];
  const Icon = style.icon;

  return (
    <div className={cn("rounded-lg border p-4", style.className)}>
      <div className="mb-2 flex items-center gap-2 text-base font-semibold">
        <Icon className="size-5" />
        {style.label}
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {diff.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
