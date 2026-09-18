import { Gauge, Wallet } from "lucide-react";
import { computeWinner } from "@/lib/executions/insights";
import { getModelDefinition } from "@/types/models";
import type { ExecutionResultDTO } from "@/types/execution";

/** Painel de veredito para o relatório impresso — mostra os dois critérios
 * (velocidade e preço) lado a lado de uma vez, sem toggle interativo. */
export function ReportVerdict({ results }: { results: ExecutionResultDTO[] }) {
  const speed = computeWinner(results, "speed");
  const price = computeWinner(results, "price");

  if (!speed && !price) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {price && (
        <div className="rounded-lg border p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wallet className="size-3.5" />
            Mais barato
          </p>
          <p className="text-lg font-semibold">{getModelDefinition(price.winner.modelId).label}</p>
          <p className="text-sm text-muted-foreground">
            {price.percentGain}% mais barato do que {getModelDefinition(price.runnerUp.modelId).label}
          </p>
        </div>
      )}
      {speed && (
        <div className="rounded-lg border p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Gauge className="size-3.5" />
            Mais rápido
          </p>
          <p className="text-lg font-semibold">{getModelDefinition(speed.winner.modelId).label}</p>
          <p className="text-sm text-muted-foreground">
            {speed.percentGain}% mais rápido do que {getModelDefinition(speed.runnerUp.modelId).label}
          </p>
        </div>
      )}
    </div>
  );
}
