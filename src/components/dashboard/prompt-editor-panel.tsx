"use client";

import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  onSubmit: () => void;
  isRunning: boolean;
}

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
  onSubmit,
  isRunning,
}: PromptEditorPanelProps) {
  const canSubmit = userMessage.trim().length > 0 && selectedModelIds.length > 0 && !isRunning;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Teste de prompt</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
            Um modelo-juiz confere se cada resposta respeita essa regra — consome créditos extras.
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label>Modelos</Label>
          <ModelSelector
            selectedModelIds={selectedModelIds}
            onChange={onSelectedModelIdsChange}
            disabled={isRunning}
          />
        </div>

        <Button onClick={onSubmit} disabled={!canSubmit} className="mt-2 w-full">
          {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
          {isRunning ? "Executando…" : "Executar comparação"}
        </Button>
      </CardContent>
    </Card>
  );
}
