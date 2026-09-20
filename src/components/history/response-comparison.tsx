import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExecutionResultDTO } from "@/types/execution";

/** Painel de uma resposta individual — texto de sucesso, erro, ou "não
 * rodou nesta versão" quando o modelo só existe do outro lado. */
function ResponsePanel({ result }: { result: ExecutionResultDTO | undefined }) {
  if (!result) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
        Não executado nesta versão
      </div>
    );
  }

  return (
    <ScrollArea className="h-40 rounded-md border bg-muted/30 p-3">
      {result.status === "SUCCESS" ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.responseText}</p>
      ) : (
        <p className="flex items-start gap-1.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {result.errorMessage ?? "Falha ao executar este modelo."}
        </p>
      )}
    </ScrollArea>
  );
}

/**
 * Mostra o texto de cada resposta gerada lado a lado, por modelo — a tabela
 * de métricas só diz "quanto custou/quão rápido", isso responde "qual
 * resposta ficou melhor", que é o que decide qual versão do prompt manter.
 */
export function ResponseComparison({
  resultsA,
  resultsB,
}: {
  resultsA: ExecutionResultDTO[];
  resultsB: ExecutionResultDTO[];
}) {
  const modelIds = Array.from(
    new Set([...resultsA.map((r) => r.modelId), ...resultsB.map((r) => r.modelId)]),
  );

  return (
    <div className="flex flex-col gap-4">
      {modelIds.map((modelId) => {
        const resultA = resultsA.find((r) => r.modelId === modelId);
        const resultB = resultsB.find((r) => r.modelId === modelId);
        return (
          <div key={modelId} className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-muted-foreground">{modelId}</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResponsePanel result={resultA} />
              <ResponsePanel result={resultB} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
