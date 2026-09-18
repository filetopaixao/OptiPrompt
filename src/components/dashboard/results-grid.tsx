import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExecutionResultDTO } from "@/types/execution";
import type { ModelId } from "@/types/models";
import { ModelResultCard } from "./model-result-card";

interface ResultsGridProps {
  results: ExecutionResultDTO[];
  pendingModelIds: ModelId[];
}

export function ResultsGrid({ results, pendingModelIds }: ResultsGridProps) {
  if (results.length === 0 && pendingModelIds.length === 0) {
    return (
      <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
        <Sparkles className="size-8" />
        <p className="text-sm">
          Preencha o prompt ao lado e selecione os modelos para comparar respostas, custo e latência.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((result) => (
        <ModelResultCard key={result.id} result={result} />
      ))}
      {pendingModelIds.map((modelId) => (
        <div key={modelId} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}
