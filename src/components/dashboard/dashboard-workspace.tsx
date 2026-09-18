"use client";

import { useState } from "react";
import { FileOutput } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import type { ComparisonPriority } from "@/lib/executions/insights";
import type { UsageSummary } from "@/lib/credits/usage-service";
import { getModelDefinition, type ModelId } from "@/types/models";
import type { ExecutionDTO } from "@/types/execution";
import { useUsageContext } from "./usage-context";
import { CostProjection } from "./cost-projection";
import { ExecutiveSummary } from "./executive-summary";
import { PremiumWarningDialog } from "./premium-warning-dialog";
import { PromptEditorPanel } from "./prompt-editor-panel";
import { ResultsGrid } from "./results-grid";

// Um modelo custo-benefício por família — cobre os 4 provedores "core" sem
// disparar chamadas caras por padrão (Meta/Groq fica fora até o usuário marcar).
const DEFAULT_MODEL_IDS: ModelId[] = [
  "gpt-4o-mini",
  "claude-3-haiku-20240307",
  "gemini-flash-lite-latest",
  "sabiazinho-4",
];

const SKIP_PREMIUM_WARNING_KEY = "optiprompt:skip-premium-warning";

export function DashboardWorkspace() {
  const { applyUsage } = useUsageContext();

  const [promptName, setPromptName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [selectedModelIds, setSelectedModelIds] = useState<ModelId[]>(DEFAULT_MODEL_IDS);
  // Preço é o critério padrão — decisão de produto: impacto financeiro é o
  // que mais importa pra quem decide. Compartilhado entre o veredito e o
  // gráfico de projeção, que reagem juntos ao mesmo toggle.
  const [priority, setPriority] = useState<ComparisonPriority>("price");

  const [isRunning, setIsRunning] = useState(false);
  const [execution, setExecution] = useState<ExecutionDTO | null>(null);
  const [isPremiumWarningOpen, setIsPremiumWarningOpen] = useState(false);

  async function runExecution() {
    setIsRunning(true);
    try {
      const response = await fetch("/api/executions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: execution?.promptId,
          promptName: promptName.trim() || undefined,
          systemPrompt,
          userMessage,
          modelIds: selectedModelIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Não foi possível executar a comparação.");
        return;
      }

      setExecution(data.execution as ExecutionDTO);
      applyUsage(data.usage as UsageSummary);
      // Rola pro topo pra garantir que o veredito/relatório fique visível —
      // se o usuário rolou a página pra preencher um prompt longo, o
      // resultado nasceria fora da área visível sem isso.
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Erro de rede ao executar a comparação. Tente novamente.");
    } finally {
      setIsRunning(false);
    }
  }

  function handleSubmit() {
    const premiumModelIds = selectedModelIds.filter(
      (modelId) => getModelDefinition(modelId).tier === "PREMIUM",
    );

    const skipWarning = sessionStorage.getItem(SKIP_PREMIUM_WARNING_KEY) === "true";
    if (premiumModelIds.length > 0 && !skipWarning) {
      setIsPremiumWarningOpen(true);
      return;
    }

    runExecution();
  }

  function handleConfirmPremiumWarning(dontWarnAgain: boolean) {
    if (dontWarnAgain) {
      sessionStorage.setItem(SKIP_PREMIUM_WARNING_KEY, "true");
    }
    runExecution();
  }

  const premiumModelIds = selectedModelIds.filter(
    (modelId) => getModelDefinition(modelId).tier === "PREMIUM",
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[380px_1fr]">
      <PromptEditorPanel
        promptName={promptName}
        onPromptNameChange={setPromptName}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        userMessage={userMessage}
        onUserMessageChange={setUserMessage}
        selectedModelIds={selectedModelIds}
        onSelectedModelIdsChange={setSelectedModelIds}
        onSubmit={handleSubmit}
        isRunning={isRunning}
      />
      <div className="flex flex-col gap-4">
        {!isRunning && execution && execution.results.length > 0 && (
          <>
            <ExecutiveSummary
              results={execution.results}
              priority={priority}
              onPriorityChange={setPriority}
            />
            <div className="flex justify-end">
              <a
                href={`/report/${execution.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <FileOutput />
                Exportar relatório PDF
              </a>
            </div>
            <CostProjection results={execution.results} priority={priority} />
          </>
        )}
        <ResultsGrid
          results={isRunning ? [] : execution?.results ?? []}
          pendingModelIds={isRunning ? selectedModelIds : []}
        />
      </div>

      <PremiumWarningDialog
        open={isPremiumWarningOpen}
        onOpenChange={setIsPremiumWarningOpen}
        premiumModelIds={premiumModelIds}
        onConfirm={handleConfirmPremiumWarning}
      />
    </div>
  );
}
