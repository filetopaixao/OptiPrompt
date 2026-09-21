"use client";

import { Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MODEL_CATALOG, type ModelId, type Provider } from "@/types/models";

const PROVIDER_LABELS: Record<Provider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  MARITACA: "Maritaca AI",
  GROQ: "Groq",
  DEEPSEEK: "DeepSeek",
  MISTRAL: "Mistral",
  META: "Meta",
};

// MARITACA e GROQ ficam fora — sem nenhum modelo atual mapeado pra eles
// (ver comentário em types/models.ts), continuam só no tipo por
// compatibilidade com resultados históricos.
const PROVIDER_ORDER: Provider[] = ["OPENAI", "ANTHROPIC", "GOOGLE", "META", "DEEPSEEK", "MISTRAL"];

interface ModelSelectorProps {
  selectedModelIds: ModelId[];
  onChange: (modelIds: ModelId[]) => void;
  /** Modelos mais usados pelo usuário (ver getMostUsedModelIds) — ganham um
   * selo de destaque como atalho visual. */
  mostUsedModelIds?: ModelId[];
  /** Catálogo visível pro plano do usuário (ver getAllowedModelIds) — o
   * Starter só vê um subconjunto, os demais planos veem tudo. */
  allowedModelIds: ModelId[];
  /** Teto de seleção simultânea do plano (Infinity quando não há limite) —
   * ao atingir, os checkboxes ainda não marcados ficam desabilitados. */
  maxSelectable: number;
  disabled?: boolean;
  /** Há uma imagem anexada no User message — desabilita modelos sem
   * supportsImages (ver types/models.ts) até a imagem ser removida. */
  imageAttached?: boolean;
}

export function ModelSelector({
  selectedModelIds,
  onChange,
  mostUsedModelIds = [],
  allowedModelIds,
  maxSelectable,
  disabled,
  imageAttached = false,
}: ModelSelectorProps) {
  const atSelectionLimit = selectedModelIds.length >= maxSelectable;

  function toggle(modelId: ModelId, checked: boolean) {
    onChange(
      checked ? [...selectedModelIds, modelId] : selectedModelIds.filter((id) => id !== modelId),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Number.isFinite(maxSelectable) && (
        <p className="text-xs text-muted-foreground">
          Seu plano permite comparar até {maxSelectable} modelos por vez.
        </p>
      )}
      {PROVIDER_ORDER.map((provider) => {
        const models = MODEL_CATALOG.filter(
          (model) => model.provider === provider && allowedModelIds.includes(model.id),
        );
        if (models.length === 0) return null;
        return (
          <div key={provider} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {PROVIDER_LABELS[provider]}
            </span>
            <div className="flex flex-col gap-2">
              {models.map((model) => {
                const inputId = `model-${model.id}`;
                const isMostUsed = mostUsedModelIds.includes(model.id);
                const isSelected = selectedModelIds.includes(model.id);
                const isImageIncompatible = imageAttached && !model.supportsImages;
                const isCheckboxDisabled =
                  disabled || (!isSelected && atSelectionLimit) || isImageIncompatible;
                return (
                  <div
                    key={model.id}
                    className={
                      isMostUsed
                        ? "flex flex-col gap-1 rounded-md bg-amber-50 p-1.5 dark:bg-amber-500/10"
                        : "flex flex-col gap-1"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={inputId}
                        disabled={isCheckboxDisabled}
                        checked={isSelected}
                        onCheckedChange={(checked) => toggle(model.id, checked === true)}
                      />
                      <Label
                        htmlFor={inputId}
                        className={
                          isCheckboxDisabled
                            ? "flex flex-1 items-center gap-1 font-normal opacity-50"
                            : "flex flex-1 cursor-pointer items-center gap-1 font-normal"
                        }
                      >
                        {model.label}
                        {isMostUsed && (
                          <Star className="size-3 fill-amber-500 text-amber-500" aria-label="Mais usado" />
                        )}
                        {isImageIncompatible && (
                          <span className="text-[10px] font-normal text-muted-foreground">
                            (sem suporte a imagem)
                          </span>
                        )}
                      </Label>
                      <Badge variant={model.tier === "PREMIUM" ? "default" : "secondary"}>
                        {model.tier === "PREMIUM" ? "Premium" : "Custo-benefício"}
                      </Badge>
                    </div>
                    {model.promoTag && (
                      <span className="ml-6 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Sparkles className="size-3" />
                        {model.promoTag}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
