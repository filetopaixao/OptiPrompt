"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { computeModelReliability } from "@/lib/executions/reliability";
import { getModelDefinition, type Provider } from "@/types/models";
import type { ExecutionDTO } from "@/types/execution";

const PROVIDER_ACCENT: Record<Provider, string> = {
  OPENAI: "bg-emerald-500",
  ANTHROPIC: "bg-orange-500",
  GOOGLE: "bg-blue-500",
  MARITACA: "bg-violet-500",
  GROQ: "bg-sky-600",
  DEEPSEEK: "bg-indigo-500",
  MISTRAL: "bg-amber-500",
  META: "bg-blue-600",
};

/** Poucas amostras deixam o percentual enganoso (1/1 = "100% confiável" não
 * quer dizer nada) — abaixo disso o resultado ganha uma ressalva em vez de
 * ser exibido com a mesma confiança de uma amostra maior. */
const LOW_SAMPLE_THRESHOLD = 3;

/** Classes completas e literais (não interpoladas) — o scanner do Tailwind
 * extrai nomes de classe do texto-fonte sem executar JS, então uma classe
 * montada em runtime via template string (`bg-${cor}-500`) nunca é
 * reconhecida e o CSS correspondente não é gerado. */
function reliabilityIndicatorClass(passRate: number): string {
  if (passRate >= 80) return "[&_[data-slot=progress-indicator]]:bg-emerald-500";
  if (passRate >= 50) return "[&_[data-slot=progress-indicator]]:bg-amber-500";
  return "[&_[data-slot=progress-indicator]]:bg-destructive";
}

function reliabilityTextClass(passRate: number): string {
  if (passRate >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (passRate >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

/**
 * Confiabilidade acumulada por modelo: diferente do selo "passou/falhou" de
 * uma execução isolada (ver RuleVerdictCell em cost-projection.tsx), esta
 * visão responde uma pergunta só visível olhando o histórico inteiro — "esse
 * modelo entrega qualidade boa toda vez, ou é inconsistente?". Some quando
 * nenhuma execução do histórico visível tinha uma regra definida.
 */
export function ModelReliabilityPanel({ executions }: { executions: ExecutionDTO[] }) {
  const rows = computeModelReliability(executions);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" />
          Confiabilidade por modelo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Taxa de aprovação na regra de IA-juiz, somando todas as execuções com regra definida no
          histórico abaixo.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((row) => {
          const { label, provider } = getModelDefinition(row.modelId);
          const isLowSample = row.total < LOW_SAMPLE_THRESHOLD;

          return (
            <div key={row.modelId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex min-w-0 flex-1 basis-48 items-center gap-2">
                <span className={cn("size-2 shrink-0 rounded-full", PROVIDER_ACCENT[provider])} />
                <span className="truncate text-sm font-medium">{label}</span>
              </div>

              <Progress
                value={row.passRate}
                className={cn("w-full flex-[2] basis-40", reliabilityIndicatorClass(row.passRate))}
              />

              <div className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
                <span className={cn("font-semibold", reliabilityTextClass(row.passRate))}>
                  {row.passRate}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({row.passed}/{row.total} teste{row.total > 1 ? "s" : ""}
                  {isLowSample ? ", poucos dados" : ""})
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
