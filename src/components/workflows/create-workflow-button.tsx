"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MODEL_CATALOG } from "@/types/models";

const defaultModel = MODEL_CATALOG[1]!.id;
const initialGraph = {
  name: "Novo workflow",
  nodes: [
    { id: "input-1", type: "input", position: { x: 40, y: 180 }, data: { kind: "input", label: "Entrada", description: "Conteúdo inicial do fluxo", prompt: "Descreva aqui a tarefa que deseja executar.", modelId: "", status: "idle" } },
    { id: "llm-1", type: "llm", position: { x: 360, y: 180 }, data: { kind: "llm", label: "Agente principal", description: "Processa a entrada com o modelo escolhido", prompt: "Produza a melhor resposta possível para a solicitação.", modelId: defaultModel, status: "idle" } },
    { id: "output-1", type: "output", position: { x: 680, y: 180 }, data: { kind: "output", label: "Resultado final", description: "Saída consolidada do workflow", prompt: "", modelId: "", status: "idle" } },
  ],
  edges: [
    { id: "input-1-llm-1", source: "input-1", target: "llm-1", animated: true },
    { id: "llm-1-output-1", source: "llm-1", target: "output-1", animated: true },
  ],
};

export function CreateWorkflowButton({ projects = [] }: { projects?: Array<{ id: string; name: string }> }) {
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const router = useRouter();
  async function create() {
    setLoading(true);
    try {
      const response = await fetch("/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...initialGraph, projectId: projectId || null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(`/app/workflows/${data.workflow.id}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível criar o workflow."); }
    finally { setLoading(false); }
  }
  return <div className="flex items-center gap-2">{projects.length > 0 && <select aria-label="Projeto compartilhado" value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Workflow pessoal</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select>}<Button onClick={create} disabled={loading}><Plus />{loading ? "Criando..." : "Novo workflow"}</Button></div>;
}
