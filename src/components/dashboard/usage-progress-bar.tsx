"use client";

import { Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUsageContext } from "./usage-context";

/**
 * Barra global de créditos do ciclo. Mostra o saldo numérico disponível vs.
 * o total do plano — não mais percentual (decisão de produto: a agência quer
 * ver o número de créditos, não uma abstração de %).
 */
export function UsageProgressBar() {
  const { creditsAvailable, creditsTotal, usagePercentage, isOverLimit, isLoading } =
    useUsageContext();

  return (
    <div className="flex min-w-[200px] flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Gauge className="size-3.5" />
          Créditos
        </span>
        <span className={cn("font-medium tabular-nums", isOverLimit && "text-destructive")}>
          {isLoading
            ? "—"
            : `${creditsAvailable.toLocaleString("pt-BR")} / ${creditsTotal.toLocaleString("pt-BR")}`}
        </span>
      </div>
      <Progress
        value={isLoading ? 0 : usagePercentage}
        className={cn(isOverLimit && "[&_[data-slot=progress-indicator]]:bg-destructive")}
      />
    </div>
  );
}
