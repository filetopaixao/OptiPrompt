import { AlertTriangle, CheckCircle2, Clock, Hash, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExecutionResultDTO } from "@/types/execution";
import type { Provider } from "@/types/models";
import { CostImpactBadge } from "./cost-impact-badge";

const PROVIDER_ACCENT: Record<Provider, string> = {
  OPENAI: "bg-emerald-500",
  ANTHROPIC: "bg-orange-500",
  GOOGLE: "bg-blue-500",
  MARITACA: "bg-violet-500",
  GROQ: "bg-sky-600",
};

const PROVIDER_LABELS: Record<Provider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  MARITACA: "Maritaca AI",
  GROQ: "Groq",
};

export function ModelResultCard({ result }: { result: ExecutionResultDTO }) {
  return (
    <Card className="flex h-full flex-col gap-3 py-4">
      <CardHeader className="flex flex-col gap-2 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className={`size-2 rounded-full ${PROVIDER_ACCENT[result.provider]}`} />
            {result.modelId}
          </div>
          <Badge variant={result.tier === "PREMIUM" ? "default" : "secondary"}>
            {result.tier === "PREMIUM" ? "Premium" : "Custo-benefício"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{PROVIDER_LABELS[result.provider]}</span>
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
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4">
        <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
          {result.status === "SUCCESS" ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.responseText}</p>
          ) : (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {result.errorMessage ?? "Falha ao executar este modelo."}
            </p>
          )}
        </ScrollArea>

        {result.ruleReason && (
          <p
            className={
              result.ruleVerdict === "FAILED"
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {result.ruleReason}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {result.latencyMs} ms
          </span>
          <span className="flex items-center gap-1">
            <Hash className="size-3.5" />
            {result.promptTokens + result.completionTokens} tokens
          </span>
          {result.status === "SUCCESS" && (
            <CostImpactBadge estimatedCostInCredits={result.estimatedCostInCredits} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
