"use client";

import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const DEFAULT_PROMPT =
  "Resuma em até 2 frases: o cliente relatou que o pedido chegou com a embalagem violada e quer reembolso total.";

/** Respostas ILUSTRATIVAS, pré-computadas — nunca chamadas de API de
 * verdade. O carregamento da landing tem que ser 100% estático, sem
 * consumir crédito nem gerar custo por visitante. Números fixos,
 * claramente rotulados como exemplo (ver aviso abaixo do card). */
const DEMO_MODELS = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    costLabel: "R$0,0003/execução",
    latencyLabel: "~900ms",
    response: "Cliente recebeu pedido com embalagem violada e solicita reembolso total.",
  },
  {
    id: "claude-haiku",
    label: "Claude Haiku 4.5",
    costLabel: "R$0,0012/execução",
    latencyLabel: "~1.400ms",
    response: "Pedido chegou com embalagem violada; cliente pede reembolso integral do valor pago.",
  },
  {
    id: "gemini-flash",
    label: "Gemini Flash Lite",
    costLabel: "R$0,0002/execução",
    latencyLabel: "~700ms",
    response: "Embalagem veio violada — cliente solicita reembolso total do pedido.",
  },
  {
    id: "deepseek-v3",
    label: "DeepSeek V3.2",
    costLabel: "R$0,0004/execução",
    latencyLabel: "~1.100ms",
    response: "Cliente relata embalagem violada na entrega e pede reembolso completo.",
  },
  {
    id: "mistral-small",
    label: "Mistral Small 3.2",
    costLabel: "R$0,0003/execução",
    latencyLabel: "~1.000ms",
    response: "Pedido com embalagem danificada; cliente quer reembolso total.",
  },
] as const;

export function LandingDemoWidget() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [selectedModelId, setSelectedModelId] = useState<string>(DEMO_MODELS[0].id);

  const selectedModel = DEMO_MODELS.find((model) => model.id === selectedModelId) ?? DEMO_MODELS[0];

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <Info className="size-3" />
          Demonstração — exemplo ilustrativo
        </Badge>
      </div>

      <label htmlFor="demo-prompt" className="mb-1.5 block text-xs font-medium text-muted-foreground">
        Prompt de exemplo (edite à vontade)
      </label>
      <Textarea
        id="demo-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="mb-4 min-h-20 resize-y"
      />

      <p className="mb-2 text-xs font-medium text-muted-foreground">Escolha um modelo pra ver o exemplo</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {DEMO_MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => setSelectedModelId(model.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              model.id === selectedModelId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            {model.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedModel.response}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
          <span>{selectedModel.costLabel} (exemplo)</span>
          <span>{selectedModel.latencyLabel} (exemplo)</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Números ilustrativos, não são o resultado do seu prompt nem custo real — teste de verdade
        no plano Free.
      </p>

      <div className="mt-4 flex justify-center">
        <a href="/cadastro" className={buttonVariants({ size: "lg" })}>
          Testar este prompt gratuitamente
          <ArrowRight />
        </a>
      </div>
    </div>
  );
}
