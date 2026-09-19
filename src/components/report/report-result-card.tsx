import { AlertTriangle, CheckCircle2, Clock, Hash, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBRLPrecise } from "@/lib/format-currency";
import { getModelDefinition } from "@/types/models";
import type { ExecutionResultDTO } from "@/types/execution";

/**
 * Versão do card de resultado para o relatório impresso: sem ScrollArea
 * (texto cortado não serve para auditoria) e já com o custo real em R$,
 * que a UI principal do dashboard mantém deliberadamente oculto.
 */
export function ReportResultCard({ result }: { result: ExecutionResultDTO }) {
  const { label } = getModelDefinition(result.modelId);

  return (
    <div className="break-inside-avoid rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {result.ruleVerdict && (
            <Badge variant={result.ruleVerdict === "PASSED" ? "default" : "destructive"}>
              {result.ruleVerdict === "PASSED" ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              {result.ruleVerdict === "PASSED" ? "Regra: passou" : "Regra: falhou"}
            </Badge>
          )}
          <Badge variant={result.tier === "PREMIUM" ? "default" : "secondary"}>
            {result.tier === "PREMIUM" ? "Premium" : "Custo-benefício"}
          </Badge>
        </div>
      </div>

      {result.status === "SUCCESS" ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.responseText}</p>
      ) : (
        <p className="flex items-start gap-1.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {result.errorMessage ?? "Falha ao executar este modelo."}
        </p>
      )}

      {result.ruleReason && (
        <p
          className={
            result.ruleVerdict === "FAILED"
              ? "mt-1 text-xs text-destructive"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {result.ruleReason}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {result.latencyMs} ms
        </span>
        <span className="flex items-center gap-1">
          <Hash className="size-3.5" />
          {result.promptTokens + result.completionTokens} tokens
        </span>
        {result.status === "SUCCESS" && (
          <span className="font-medium text-foreground">
            {formatBRLPrecise(result.estimatedCostInBRL)}/requisição
          </span>
        )}
      </div>
    </div>
  );
}
