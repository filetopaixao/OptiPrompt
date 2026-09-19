"use client";

import { Loader2, Play } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ModelId } from "@/types/models";
import { ModelSelector } from "./model-selector";

interface PromptEditorPanelProps {
  promptName: string;
  onPromptNameChange: (value: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  userMessage: string;
  onUserMessageChange: (value: string) => void;
  rule: string;
  onRuleChange: (value: string) => void;
  selectedModelIds: ModelId[];
  onSelectedModelIdsChange: (modelIds: ModelId[]) => void;
  mostUsedModelIds: ModelId[];
  onSubmit: () => void;
  isRunning: boolean;
}

// Selo de destaque bem maior que o padrão do componente (size-4) pra ficar
// óbvio que a seção é clicável/recolhível.
const TRIGGER_ICON_CLASS = "**:data-[slot=accordion-trigger-icon]:size-6";

export function PromptEditorPanel({
  promptName,
  onPromptNameChange,
  systemPrompt,
  onSystemPromptChange,
  userMessage,
  onUserMessageChange,
  rule,
  onRuleChange,
  selectedModelIds,
  onSelectedModelIdsChange,
  mostUsedModelIds,
  onSubmit,
  isRunning,
}: PromptEditorPanelProps) {
  const canSubmit = userMessage.trim().length > 0 && selectedModelIds.length > 0 && !isRunning;

  return (
    <div className="flex flex-col gap-4">
      {/* multiple=false (padrão do Accordion) já garante o comportamento de
       * sanfona: abrir uma seção fecha a outra automaticamente. Cada item
       * fica dentro do seu próprio wrapper com visual de card — assim
       * "not-last:border-b" (do componente base) nunca se aplica, porque
       * cada AccordionItem passa a ser filho único do seu wrapper. */}
      <Accordion defaultValue={["prompt"]} className="gap-4">
        <div className="rounded-xl border bg-card px-4 shadow-sm ring-1 ring-foreground/10">
          <AccordionItem value="prompt">
            <AccordionTrigger className={`text-base font-semibold hover:no-underline ${TRIGGER_ICON_CLASS}`}>
              Teste de prompt
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prompt-name">Nome do prompt</Label>
                  <Input
                    id="prompt-name"
                    placeholder="Ex.: Atendimento — resumo de ticket"
                    value={promptName}
                    onChange={(event) => onPromptNameChange(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="system-prompt">System prompt</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="Você é um assistente especializado em..."
                    className="min-h-28 resize-y"
                    value={systemPrompt}
                    onChange={(event) => onSystemPromptChange(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="user-message">User message</Label>
                  <Textarea
                    id="user-message"
                    placeholder="Mensagem de teste enviada ao modelo..."
                    className="min-h-28 resize-y"
                    value={userMessage}
                    onChange={(event) => onUserMessageChange(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rule">Regra a verificar (opcional)</Label>
                  <Textarea
                    id="rule"
                    placeholder='Ex.: A resposta não pode dizer que é uma IA.'
                    className="min-h-16 resize-y"
                    value={rule}
                    onChange={(event) => onRuleChange(event.target.value)}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-muted-foreground">
                    Um modelo-juiz confere se cada resposta respeita essa regra — consome créditos
                    extras.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </div>

        <div className="rounded-xl border bg-card px-4 shadow-sm ring-1 ring-foreground/10">
          <AccordionItem value="models">
            <AccordionTrigger className={`text-base font-semibold hover:no-underline ${TRIGGER_ICON_CLASS}`}>
              <span className="flex items-center gap-2">
                Modelos
                <Badge variant={selectedModelIds.length > 0 ? "default" : "outline"}>
                  {selectedModelIds.length} selecionado{selectedModelIds.length === 1 ? "" : "s"}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ModelSelector
                selectedModelIds={selectedModelIds}
                onChange={onSelectedModelIdsChange}
                mostUsedModelIds={mostUsedModelIds}
                disabled={isRunning}
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>

      <Button onClick={onSubmit} disabled={!canSubmit} className="w-full">
        {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
        {isRunning ? "Executando…" : "Executar comparação"}
      </Button>
    </div>
  );
}
