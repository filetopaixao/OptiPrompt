"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlaskConical, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/dashboard/model-selector";
import type { BenchmarkSummaryDTO } from "@/types/benchmark";
import type { ModelId } from "@/types/models";
import { createBenchmark } from "@/app/app/benchmarks/actions";

interface ProjectOption {
  id: string;
  name: string;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function NewBenchmarkDialog({
  projects,
  allowedModelIds,
  maxSelectableModels,
}: {
  projects: ProjectOption[];
  allowedModelIds: ModelId[];
  maxSelectableModels: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [modelIds, setModelIds] = useState<ModelId[]>([]);

  function reset() {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setUserMessage("");
    setModelIds([]);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createBenchmark({
        projectId,
        name,
        description: description || undefined,
        systemPrompt: systemPrompt || undefined,
        userMessage,
        modelIds,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.push(`/app/benchmarks/${result.benchmarkId}`);
    });
  }

  const canSubmit = projectId && name.trim() && userMessage.trim() && modelIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Novo benchmark
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo benchmark</DialogTitle>
          <DialogDescription>
            Comece com um caso de teste só — você adiciona mais depois. Ele já roda de verdade via
            OpenRouter quando você clicar em &ldquo;Executar&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="benchmark-project">Projeto (cliente)</Label>
            <select
              id="benchmark-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="benchmark-name">Nome do benchmark</Label>
            <Input
              id="benchmark-name"
              placeholder="Ex.: Atendimento — resumo de ticket"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="benchmark-description">Objetivo (opcional)</Label>
            <Input
              id="benchmark-description"
              placeholder="O que esse benchmark decide?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="benchmark-system-prompt">Instruções do Sistema (Prompt) — primeiro caso</Label>
            <Textarea
              id="benchmark-system-prompt"
              className="min-h-20 resize-y"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="benchmark-user-message">Mensagem do Usuário — primeiro caso</Label>
            <Textarea
              id="benchmark-user-message"
              className="min-h-20 resize-y"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Modelos</Label>
            <ModelSelector
              selectedModelIds={modelIds}
              onChange={setModelIds}
              allowedModelIds={allowedModelIds}
              maxSelectable={maxSelectableModels}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !canSubmit}>
            Criar benchmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BenchmarksExplorer({
  benchmarks,
  projects,
  allowedModelIds,
  maxSelectableModels,
}: {
  benchmarks: BenchmarkSummaryDTO[];
  projects: ProjectOption[];
  allowedModelIds: ModelId[];
  maxSelectableModels: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NewBenchmarkDialog
          projects={projects}
          allowedModelIds={allowedModelIds}
          maxSelectableModels={maxSelectableModels}
        />
      </div>

      {benchmarks.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
          <FlaskConical className="size-8" />
          <p className="text-sm">Nenhum benchmark ainda. Crie o primeiro acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benchmarks.map((benchmark) => (
            <Link key={benchmark.id} href={`/app/benchmarks/${benchmark.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{benchmark.name}</CardTitle>
                    {benchmark.hasBaseline && <Badge variant="secondary">Baseline definida</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{benchmark.projectName}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {benchmark.caseCount} caso{benchmark.caseCount === 1 ? "" : "s"}
                  </span>
                  <span>
                    {benchmark.modelCount} modelo{benchmark.modelCount === 1 ? "" : "s"}
                  </span>
                  <span>
                    {benchmark.runCount} execuç{benchmark.runCount === 1 ? "ão" : "ões"}
                  </span>
                  {benchmark.lastRunAt && (
                    <span>Última: {dateFormatter.format(new Date(benchmark.lastRunAt))}</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
