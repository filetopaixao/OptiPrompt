"use client";

import { useRef } from "react";
import { Loader2, Paperclip, Play, X } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ModelId } from "@/types/models";
import { ModelSelector } from "./model-selector";

export interface AttachedImage {
  dataUrl: string;
  name: string;
}

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
  allowedModelIds: ModelId[];
  maxSelectableModels: number;
  onSubmit: () => void;
  isRunning: boolean;
  /** Imagem anexada no User message (ver upload de arquivo abaixo) — quando
   * presente, filtra o seletor de modelos pra só multimodais (ver
   * ModelSelector). */
  attachedImage: AttachedImage | null;
  onAttachImage: (image: AttachedImage) => void;
  onRemoveImage: () => void;
}

// Selo de destaque bem maior que o padrão do componente (size-4) pra ficar
// óbvio que a seção é clicável/recolhível.
const TRIGGER_ICON_CLASS = "**:data-[slot=accordion-trigger-icon]:size-6";

// Borda um pouco mais escura que o padrão (border-input) e foco mais óbvio
// que o padrão do design system — só nos campos desta coluna, sem alterar
// os componentes Input/Textarea globais usados no resto do app.
const FIELD_CLASS = "border-foreground/20 focus-visible:ring-3 focus-visible:ring-primary/40";

const MIN_MODELS_TO_COMPARE = 2;

/** Teto de imagem antes de virar base64 — ~5MB crus, o mesmo limite
 * validado de novo em /api/executions (nunca confiar só no front). */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Teto de arquivo de texto — bem menor, já que o conteúdo é só concatenado
 * ao userMessage (que tem limite de 20.000 caracteres no back). */
const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** .docx é um zip com XML por dentro — dá pra extrair o texto todo no
 * próprio navegador (import sob demanda: só quem realmente anexa um .docx
 * paga o custo do pacote). .doc (o formato binário antigo, pré-2007) não
 * tem parser client-side viável — precisaria de um conversor no servidor
 * (LibreOffice headless ou equivalente), fora do escopo aqui. */
async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/** PDF.js — "webpack.mjs" é o entry point oficial do próprio pacote pra uso
 * com bundler (ver node_modules/pdfjs-dist/webpack.mjs): já configura o
 * worker via `new Worker(new URL(...))`, o mesmo padrão de asset que o
 * Next.js/Turbopack sabe empacotar sozinho, sem precisar copiar o arquivo
 * do worker pra public/ nem apontar pra um CDN externo. */
async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/webpack.mjs");
  const arrayBuffer = await readFileAsArrayBuffer(file);
  // Sem isso, o pdf.js não consegue medir glifos de fontes padrão não
  // embutidas no PDF (Helvetica, Times etc.) e trunca o texto no meio —
  // confirmado num PDF de teste real. Os arquivos ficam vendorizados em
  // public/pdfjs/standard_fonts (copiados de node_modules/pdfjs-dist),
  // servidos como assets estáticos.
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
  }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n\n");
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
  mostUsedModelIds,
  allowedModelIds,
  maxSelectableModels,
  onSubmit,
  isRunning,
  attachedImage,
  onAttachImage,
  onRemoveImage,
}: PromptEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comparar exige pelo menos 2 modelos — com 1 só não há o que comparar
  // (ExecutiveSummary/CostProjection já assumiam isso, agora a UI barra
  // antes de gastar crédito rodando uma execução que não gera veredito).
  const hasEnoughModels = selectedModelIds.length >= MIN_MODELS_TO_COMPARE;
  const canSubmit = userMessage.trim().length > 0 && hasEnoughModels && !isRunning;

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite selecionar o mesmo arquivo de novo depois
    if (!file) return;

    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("Imagem muito grande (máximo 5MB).");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onAttachImage({ dataUrl, name: file.name });
      } catch {
        toast.error("Não foi possível ler a imagem.");
      }
      return;
    }

    if (file.name.toLowerCase().endsWith(".doc") && !file.name.toLowerCase().endsWith(".docx")) {
      toast.error(
        "Arquivo .doc (formato antigo do Word) não é suportado — salve como .docx e tente de novo.",
      );
      return;
    }

    if (file.size > MAX_TEXT_FILE_BYTES) {
      toast.error("Arquivo muito grande (máximo 2MB).");
      return;
    }

    const isDocx = file.type === DOCX_MIME || file.name.toLowerCase().endsWith(".docx");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    try {
      // .docx e .pdf precisam de parser (mammoth / pdf.js); qualquer outro
      // tipo (.txt, .md, .csv, .json, .log) é lido como texto puro. O
      // conteúdo é colado direto no User message em vez de enviar o
      // arquivo em si.
      const text = isDocx
        ? await extractDocxText(file)
        : isPdf
          ? await extractPdfText(file)
          : await readFileAsText(file);
      const separator = userMessage.trim() ? "\n\n" : "";
      onUserMessageChange(`${userMessage}${separator}--- Arquivo: ${file.name} ---\n${text}`);
    } catch {
      toast.error("Não foi possível ler o conteúdo do arquivo.");
    }
  }

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
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prompt-name">Nome do prompt</Label>
                  <Input
                    id="prompt-name"
                    placeholder="Ex.: Atendimento — resumo de ticket"
                    className={FIELD_CLASS}
                    value={promptName}
                    onChange={(event) => onPromptNameChange(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="system-prompt">Instruções do Sistema (Prompt)</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="Você é um assistente especializado em..."
                    className={`min-h-28 resize-y ${FIELD_CLASS}`}
                    value={systemPrompt}
                    onChange={(event) => onSystemPromptChange(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-message">Mensagem do Usuário</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.txt,.md,.csv,.json,.log,.docx,.pdf"
                      className="hidden"
                      onChange={handleFileSelected}
                      disabled={isRunning}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRunning}
                    >
                      <Paperclip className="size-3.5" />
                      Anexar arquivo
                    </Button>
                  </div>
                  <Textarea
                    id="user-message"
                    placeholder="Mensagem de teste enviada ao modelo..."
                    className={`min-h-28 resize-y ${FIELD_CLASS}`}
                    value={userMessage}
                    onChange={(event) => onUserMessageChange(event.target.value)}
                    disabled={isRunning}
                  />
                  {attachedImage && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- preview de uma data URL local, não um asset otimizável. */}
                      <img
                        src={attachedImage.dataUrl}
                        alt={attachedImage.name}
                        className="size-10 shrink-0 rounded object-cover"
                      />
                      <span className="flex-1 truncate text-xs text-muted-foreground">
                        {attachedImage.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={onRemoveImage}
                        disabled={isRunning}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Anexar imagem filtra o seletor pra só modelos multimodais. Arquivo de texto,
                    .docx ou .pdf tem o conteúdo colado direto aqui em cima (.doc antigo não é
                    suportado).
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rule">Regra a verificar (opcional)</Label>
                  <Textarea
                    id="rule"
                    placeholder='Ex.: A resposta não pode dizer que é uma IA.'
                    className={`min-h-16 resize-y ${FIELD_CLASS}`}
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
                allowedModelIds={allowedModelIds}
                maxSelectable={maxSelectableModels}
                disabled={isRunning}
                imageAttached={attachedImage !== null}
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>

      {/* mt-auto empurra pro fim da coluna quando ela é esticada pelo grid
       * (lado a lado com os resultados, em telas lg+) — sticky então mantém
       * o botão sempre visível enquanto o usuário rola, sem precisar caçar
       * o CTA depois de abrir a seção de Modelos. Em telas menores (colunas
       * empilhadas), sticky não tem espaço extra pra "flutuar" e o botão
       * simplesmente aparece logo após o accordion, como antes. */}
      <div className="sticky bottom-4 z-10 mt-auto rounded-xl border bg-card p-3 shadow-md ring-1 ring-foreground/10">
        <Button onClick={onSubmit} disabled={!canSubmit} className="w-full">
          {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
          {isRunning ? "Executando…" : "Executar comparação"}
        </Button>
        {!hasEnoughModels && !isRunning && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Selecione ao menos {MIN_MODELS_TO_COMPARE} modelos para comparar.
          </p>
        )}
      </div>
    </div>
  );
}
