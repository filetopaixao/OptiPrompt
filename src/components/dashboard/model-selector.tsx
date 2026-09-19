"use client";

import { Sparkles } from "lucide-react";
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
};

// MARITACA fica fora — sem modelos novos desde a migração pro OpenRouter
// (ver comentário em types/models.ts), continua só no tipo por compatibilidade
// com resultados históricos.
const PROVIDER_ORDER: Provider[] = ["OPENAI", "ANTHROPIC", "GOOGLE", "GROQ"];

interface ModelSelectorProps {
  selectedModelIds: ModelId[];
  onChange: (modelIds: ModelId[]) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModelIds, onChange, disabled }: ModelSelectorProps) {
  function toggle(modelId: ModelId, checked: boolean) {
    onChange(
      checked ? [...selectedModelIds, modelId] : selectedModelIds.filter((id) => id !== modelId),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {PROVIDER_ORDER.map((provider) => {
        const models = MODEL_CATALOG.filter((model) => model.provider === provider);
        return (
          <div key={provider} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {PROVIDER_LABELS[provider]}
            </span>
            <div className="flex flex-col gap-2">
              {models.map((model) => {
                const inputId = `model-${model.id}`;
                return (
                  <div key={model.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={inputId}
                        disabled={disabled}
                        checked={selectedModelIds.includes(model.id)}
                        onCheckedChange={(checked) => toggle(model.id, checked === true)}
                      />
                      <Label htmlFor={inputId} className="flex-1 cursor-pointer font-normal">
                        {model.label}
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
