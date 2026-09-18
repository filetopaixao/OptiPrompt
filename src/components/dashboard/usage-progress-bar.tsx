"use client";

import { Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUsageContext } from "./usage-context";

/**
 * Barra global de créditos do ciclo. Mostra o saldo numérico disponível vs.
 * o total do plano — não mais percentual (decisão de produto: a agência quer
 * ver o número de créditos, não uma abstração de %).
 *
 * A barra preenche por % DISPONÍVEL (não % usado) pra bater com o número ao
 * lado — como um medidor de combustível: cheia = sobra muito crédito, vazia
 * = acabando. Usar % usado aqui fazia a barra parecer "vazia" mesmo com o
 * saldo quase inteiro disponível.
 */
export function UsageProgressBar() {
  const { creditsAvailable, creditsTotal, usagePercentage, isOverLimit, isLoading } =
    useUsageContext();
  const availablePercentage = 100 - usagePercentage;

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
        value={isLoading ? 0 : availablePercentage}
        className={cn(isOverLimit && "[&_[data-slot=progress-indicator]]:bg-destructive")}
      />
    </div>
  );
}
