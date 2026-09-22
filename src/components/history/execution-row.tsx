"use client";

import { CheckCircle2, Clock, FileOutput, FolderKanban, Hash, Layers, User, Wallet, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatBRLPrecise } from "@/lib/format-currency";
import { aggregateExecutionMetrics } from "@/lib/executions/metrics";
import { cn } from "@/lib/utils";
import type { ExecutionDTO } from "@/types/execution";

interface ExecutionRowProps {
  execution: ExecutionDTO;
  isSelected: boolean;
  onToggle: () => void;
  /** false quando o plano não inclui "Comparação de versões" — some o
   * checkbox de seleção, a linha vira só uma entrada de consulta. */
  selectable: boolean;
  /** Usado só na visão de equipe do dono Enterprise, pra destacar como
   * "Você" a execução que ele mesmo rodou, em vez do próprio nome. */
  currentUserId?: string;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ExecutionRow({
  execution,
  isSelected,
  onToggle,
  selectable,
  currentUserId,
}: ExecutionRowProps) {
  const metrics = aggregateExecutionMetrics(execution);
  const inputId = `execution-${execution.id}`;
  const isOwnExecution = execution.executedBy?.id === currentUserId;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-3 transition-colors",
        isSelected && "border-primary ring-1 ring-primary",
      )}
    >
      {selectable && <Checkbox id={inputId} checked={isSelected} onCheckedChange={onToggle} />}
      <Label
        htmlFor={inputId}
        className={cn(
          "flex flex-1 flex-col gap-1 font-normal",
          selectable ? "cursor-pointer" : "cursor-default",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{execution.promptName}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(execution.createdAt))}
          </span>
          {execution.executedBy && (
            <Badge
              variant={isOwnExecution ? "default" : "outline"}
              className="gap-1 text-xs font-normal"
            >
              <User className="size-3" />
              {isOwnExecution ? "Você" : execution.executedBy.name || execution.executedBy.email}
            </Badge>
          )}
          {execution.project && (
            <Badge variant="secondary" className="gap-1 text-xs font-normal">
              <FolderKanban className="size-3" />
              {execution.project.name}
            </Badge>
          )}
          {metrics.ruleSummary && (
            <Badge
              variant={metrics.ruleSummary === "PASSED" ? "default" : "destructive"}
              className="gap-1"
            >
              {metrics.ruleSummary === "PASSED" ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              {metrics.ruleSummary === "PASSED" ? "Regra: passou" : "Regra: falhou"}
            </Badge>
          )}
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {execution.userMessage || "(sem mensagem do usuário)"}
        </p>
      </Label>
      <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="size-3.5" />
          {metrics.modelCount} modelos
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {metrics.avgLatencyMs} ms
        </span>
        <span className="flex items-center gap-1">
          <Hash className="size-3.5" />
          {metrics.totalTokens} tokens
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="size-3.5" />
          {formatBRLPrecise(metrics.totalCostInBRL)}
        </span>
        <a
          href={`/report/${execution.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-foreground hover:underline"
          title="Ver relatório"
        >
          <FileOutput className="size-3.5" />
          Relatório
        </a>
      </div>
    </div>
  );
}
