import { Separator } from "@/components/ui/separator";
import type { ExecutionDTO } from "@/types/execution";
import { MetricsComparisonTable } from "./metrics-comparison-table";
import { PromptDiff } from "./prompt-diff";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function VersionComparePanel({
  executionA,
  executionB,
}: {
  executionA: ExecutionDTO;
  executionB: ExecutionDTO;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-primary">Execução A</span>
          <p className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(executionA.createdAt))}
          </p>
        </div>
        <div>
          <span className="font-medium text-primary">Execução B</span>
          <p className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(executionB.createdAt))}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">System prompt</h3>
        <div className="rounded-md border bg-muted/30 p-3">
          <PromptDiff before={executionA.systemPrompt} after={executionB.systemPrompt} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">User message</h3>
        <div className="rounded-md border bg-muted/30 p-3">
          <PromptDiff before={executionA.userMessage} after={executionB.userMessage} />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Performance e custo por modelo</h3>
        <MetricsComparisonTable resultsA={executionA.results} resultsB={executionB.results} />
      </div>
    </div>
  );
}
