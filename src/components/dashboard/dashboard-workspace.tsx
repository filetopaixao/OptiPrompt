"use client";

import { useState } from "react";
import { FileOutput } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { computeWinner, type ComparisonPriority } from "@/lib/executions/insights";
import type { UsageSummary } from "@/lib/credits/usage-service";
import { canUseCostProjection, getAllowedModelIds, getMaxSimultaneousModels } from "@/lib/plans/model-access";
import { getModelDefinition, type ModelId } from "@/types/models";
import type { ExecutionDTO, ExecutionResultDTO } from "@/types/execution";
import { useUsageContext } from "./usage-context";
import { CostProjection } from "./cost-projection";
import { ExecutiveSummary } from "./executive-summary";
import { LockedFeatureCard } from "./locked-feature-card";
import { PremiumWarningDialog } from "./premium-warning-dialog";
import { PromptEditorPanel, type AttachedImage } from "./prompt-editor-panel";
import { ResultsGrid } from "./results-grid";

const SKIP_PREMIUM_WARNING_KEY = "optiprompt:skip-premium-warning";

/**
 * Dados de EXEMPLO pro preview do card travado de "Projeção de custo em
 * escala" — nunca os resultados reais. Um blur é só CSS: quem inspecionar o
 * elemento e remover a classe veria o que estiver por trás, então o próprio
 * conteúdo enviado ao navegador já precisa ser inofensivo.
 */
const SAMPLE_COST_PROJECTION_RESULTS: ExecutionResultDTO[] = [
  {
    id: "sample-1",
    modelId: "openai/gpt-4o-mini",
    provider: "OPENAI",
    tier: "COST_EFFECTIVE",
    status: "SUCCESS",
    responseText: null,
    errorMessage: null,
    promptTokens: 120,
    completionTokens: 340,
    latencyMs: 900,
    estimatedCostInCredits: 3,
    estimatedCostInBRL: 0.003,
    ruleVerdict: null,
    ruleReason: null,
  },
  {
    id: "sample-2",
    modelId: "anthropic/claude-haiku-4.5",
    provider: "ANTHROPIC",
    tier: "COST_EFFECTIVE",
    status: "SUCCESS",
    responseText: null,
    errorMessage: null,
    promptTokens: 120,
    completionTokens: 340,
    latencyMs: 1400,
    estimatedCostInCredits: 12,
    estimatedCostInBRL: 0.012,
    ruleVerdict: null,
    ruleReason: null,
  },
];

export function DashboardWorkspace({
  mostUsedModelIds,
  planSlug,
}: {
  mostUsedModelIds: ModelId[];
  planSlug: string | null;
}) {
  const { applyUsage } = useUsageContext();
  const allowedModelIds = getAllowedModelIds(planSlug);
  const maxSelectableModels = getMaxSimultaneousModels(planSlug);
  const hasCostProjection = canUseCostProjection(planSlug);

  const [promptName, setPromptName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [rule, setRule] = useState("");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  // Vazio por padrão — obriga a escolha explícita do modelo em vez de rodar
  // sem querer com uma seleção pré-marcada.
  const [selectedModelIds, setSelectedModelIds] = useState<ModelId[]>([]);
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
          imageDataUrl: attachedImage?.dataUrl,
          modelIds: selectedModelIds,
          rule: rule.trim() || undefined,
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
      // resultado nasceria fora da área visível sem isso. Instantâneo (sem
      // "smooth") pra nunca ficar pela metade se o usuário mexer no scroll
      // ou trocar de aba durante a animação.
      window.scrollTo(0, 0);
    } catch {
      toast.error("Erro de rede ao executar a comparação. Tente novamente.");
    } finally {
      setIsRunning(false);
    }
  }

  // Anexar imagem remove da seleção qualquer modelo que não aceite imagem —
  // o ModelSelector já desabilita o checkbox pra impedir marcar um novo,
  // mas um que já estivesse marcado antes do anexo precisa ser tirado aqui.
  function handleAttachImage(image: AttachedImage) {
    setAttachedImage(image);
    setSelectedModelIds((current) => {
      const compatible = current.filter((modelId) => getModelDefinition(modelId).supportsImages);
      if (compatible.length < current.length) {
        toast.warning("Alguns modelos selecionados não aceitam imagem e foram removidos.");
      }
      return compatible;
    });
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
        rule={rule}
        onRuleChange={setRule}
        selectedModelIds={selectedModelIds}
        onSelectedModelIdsChange={setSelectedModelIds}
        mostUsedModelIds={mostUsedModelIds}
        allowedModelIds={allowedModelIds}
        maxSelectableModels={maxSelectableModels}
        onSubmit={handleSubmit}
        isRunning={isRunning}
        attachedImage={attachedImage}
        onAttachImage={handleAttachImage}
        onRemoveImage={() => setAttachedImage(null)}
      />
      <div className="flex flex-col gap-4">
        {!isRunning && execution && execution.results.length > 0 && (
          <>
            <ExecutiveSummary
              results={execution.results}
              priority={priority}
              onPriorityChange={setPriority}
            />
            {(() => {
              const exportReportButton = (
                <a
                  href={`/report/${execution.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <FileOutput />
                  Exportar relatório PDF
                </a>
              );

              // Mesma trava nos dois modos do toggle — antes só "price" ficava
              // travado, então trocar pra "Velocidade" destravava o gráfico
              // real sem querer (mesma seção, comportamento inconsistente).
              return !hasCostProjection ? (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-end print:hidden">{exportReportButton}</div>
                  <LockedFeatureCard
                    featureName={
                      priority === "price" ? "Projeção de custo em escala" : "Comparação de velocidade"
                    }
                    message={
                      priority === "price"
                        ? "Disponível nos planos Agência (Pro) e Enterprise — projete o custo mensal de cada modelo no seu volume real de requisições."
                        : "Disponível nos planos Agência (Pro) e Enterprise — compare a latência de cada modelo lado a lado."
                    }
                    previewContent={
                      <CostProjection results={SAMPLE_COST_PROJECTION_RESULTS} priority={priority} />
                    }
                  />
                </div>
              ) : (
                <CostProjection
                  results={execution.results}
                  priority={priority}
                  headerActions={exportReportButton}
                />
              );
            })()}
          </>
        )}
        <ResultsGrid
          results={isRunning ? [] : execution?.results ?? []}
          pendingModelIds={isRunning ? selectedModelIds : []}
          winnerId={
            !isRunning && execution ? computeWinner(execution.results, priority)?.winner.id : undefined
          }
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
