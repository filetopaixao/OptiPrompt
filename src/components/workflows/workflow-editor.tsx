"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlow, type Connection, type EdgeChange, type NodeChange, type NodeTypes } from "@xyflow/react";
import { Bot, Braces, History, Loader2, LogIn, LogOut, Play, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUsageContext } from "@/components/dashboard/usage-context";
import { MODEL_CATALOG, type ModelId } from "@/types/models";
import type { UsageSummary } from "@/lib/credits/usage-service";
import type { WorkflowEdge, WorkflowNode as AppNode, WorkflowNodeKind, WorkflowProjectDTO, WorkflowRunDTO } from "@/lib/workflows/types";
import { WorkflowNode } from "./workflow-node";

const nodeTypes: NodeTypes = { input: WorkflowNode, llm: WorkflowNode, transform: WorkflowNode, output: WorkflowNode };
const palette = [
  {
    kind: "input" as const,
    label: "Entrada",
    icon: LogIn,
    description: "Define o conteúdo que inicia o workflow.",
    example: "Ex.: briefing, pergunta do cliente ou texto de um documento.",
  },
  {
    kind: "llm" as const,
    label: "Agente",
    icon: Bot,
    description: "Envia a entrada para um modelo de IA com uma instrução.",
    example: "Ex.: analisar o briefing e criar três propostas de campanha.",
  },
  {
    kind: "transform" as const,
    label: "Transformar",
    icon: Braces,
    description: "Formata a resposta anterior sem consumir créditos de IA.",
    example: "Ex.: converter para JSON, maiúsculas ou minúsculas.",
  },
  {
    kind: "output" as const,
    label: "Saída",
    icon: LogOut,
    description: "Reúne e apresenta o resultado final do workflow.",
    example: "Ex.: resposta final combinada de dois ou mais agentes.",
  },
];

export function WorkflowEditor({ initialWorkflow, allowedModelIds, testedModelIds }: { initialWorkflow: WorkflowProjectDTO; allowedModelIds: ModelId[]; testedModelIds: ModelId[] }) {
  const [name, setName] = useState(initialWorkflow.name);
  const [nodes, setNodes] = useState<AppNode[]>(initialWorkflow.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialWorkflow.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runs, setRuns] = useState<WorkflowRunDTO[]>(initialWorkflow.runs ?? []);
  const [saving, setSaving] = useState(false); const [running, setRunning] = useState(false); const [historyOpen, setHistoryOpen] = useState(false);
  const { applyUsage } = useUsageContext(); const router = useRouter(); const testedModels = new Set(testedModelIds);
  const selected = nodes.find((node) => node.id === selectedId);
  const selectedHelp = selected ? palette.find((item) => item.kind === selected.data.kind) : undefined;
  const onNodesChange = useCallback((changes: NodeChange<AppNode>[]) => setNodes((current) => applyNodeChanges(changes, current)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((current) => applyEdgeChanges(changes, current)), []);
  const onConnect = useCallback((connection: Connection) => setEdges((current) => addEdge({ ...connection, animated: true }, current)), []);
  const cleanNodes = useMemo(() => nodes.map((node) => ({ ...node, data: { ...node.data, status: "idle" as const, result: undefined } })), [nodes]);

  function addNode(kind: WorkflowNodeKind) {
    const id = `${kind}-${crypto.randomUUID()}`;
    const defaultModel = allowedModelIds[0] ?? "";
    setNodes((current) => [...current, { id, type: kind, position: { x: 280 + current.length * 30, y: 120 + current.length * 35 }, data: { kind, label: palette.find((item) => item.kind === kind)!.label, description: "Configure este bloco", prompt: "", modelId: kind === "llm" ? defaultModel : "", status: "idle" } }]);
    setSelectedId(id);
  }
  function updateSelected(data: Partial<AppNode["data"]>) { setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, data: { ...node.data, ...data } } : node)); }
  async function save(showToast = true) {
    setSaving(true);
    try { const response = await fetch(`/api/workflows/${initialWorkflow.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, nodes: cleanNodes, edges }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); if (showToast) toast.success("Workflow salvo."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar."); throw error; }
    finally { setSaving(false); }
  }
  async function run() {
    setRunning(true); setNodes((current) => current.map((node) => ({ ...node, data: { ...node.data, status: "running" } })));
    try { await save(false); const response = await fetch(`/api/workflows/${initialWorkflow.id}/runs`, { method: "POST" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); const run = data.run as WorkflowRunDTO; setRuns((current) => [run, ...current]); setNodes((current) => current.map((node) => ({ ...node, data: { ...node.data, status: "success", result: run.steps.find((step) => step.nodeId === node.id)?.outputText ?? undefined } }))); applyUsage(data.usage as UsageSummary); toast.success("Workflow executado com sucesso."); }
    catch (error) { setNodes((current) => current.map((node) => ({ ...node, data: { ...node.data, status: "error" } }))); toast.error(error instanceof Error ? error.message : "Falha ao executar."); }
    finally { setRunning(false); }
  }
  async function remove() { if (!confirm("Excluir este workflow e todo o histórico?")) return; const response = await fetch(`/api/workflows/${initialWorkflow.id}`, { method: "DELETE" }); if (response.ok) { router.push("/app/workflows"); router.refresh(); } }

  return <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Input aria-label="Nome do workflow" value={name} onChange={(event) => setName(event.target.value)} className="max-w-xs font-semibold" />
      <div className="ml-auto flex gap-2"><Button variant="destructive" onClick={remove}><Trash2 />Excluir workflow</Button><Button variant="outline" aria-pressed={historyOpen} onClick={() => setHistoryOpen((value) => !value)}><History />{historyOpen ? "Ocultar histórico" : "Histórico"}</Button><Button variant="outline" onClick={() => save()} disabled={saving || running}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Salvar</Button><Button onClick={run} disabled={running || saving}>{running ? <Loader2 className="animate-spin" /> : <Play />}Executar</Button></div>
    </header>
    <div className={`grid min-h-0 flex-1 ${historyOpen ? "grid-cols-[180px_minmax(0,1fr)_300px_320px]" : "grid-cols-[180px_minmax(0,1fr)_300px]"}`}>
      <aside className="overflow-y-auto border-r bg-background p-3"><p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Blocos</p><div className="space-y-2">{palette.map(({ kind, label, icon: Icon, description, example }) => <button type="button" key={kind} className="w-full rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/40" onClick={() => addNode(kind)}><span className="flex items-center gap-2 text-sm font-medium"><span className="rounded-md bg-primary/10 p-1.5 text-primary"><Icon className="size-4" /></span>{label}<Plus className="ml-auto size-3.5 text-muted-foreground" /></span><span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{description}</span><span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground/80">{example}</span></button>)}</div></aside>
      <section className="min-w-0"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelectedId(node.id)} onPaneClick={() => setSelectedId(null)} fitView><Background /><Controls /><MiniMap /></ReactFlow></section>
      <aside className="overflow-y-auto border-l bg-background p-4">{selected ? <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Configurar bloco</h2><Button variant="ghost" size="icon-sm" aria-label="Excluir bloco" title="Excluir bloco" onClick={() => { setNodes((current) => current.filter((node) => node.id !== selected.id)); setEdges((current) => current.filter((edge) => edge.source !== selected.id && edge.target !== selected.id)); setSelectedId(null); }}><Trash2 /></Button></div>{selectedHelp && <div className="rounded-lg border bg-muted/40 p-3"><p className="text-xs font-medium">Como usar este bloco</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{selectedHelp.description}</p><p className="mt-2 text-xs italic text-muted-foreground">{selectedHelp.example}</p>{selected.data.kind === "transform" && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Operações aceitas: escreva “JSON”, “maiúsculas” ou “minúsculas” na instrução.</p>}</div>}<div><Label>Nome</Label><Input value={selected.data.label} onChange={(e) => updateSelected({ label: e.target.value })} /></div><div><Label>Descrição</Label><Input value={selected.data.description} onChange={(e) => updateSelected({ description: e.target.value })} /></div>{selected.data.kind === "llm" && <div><Label>Modelo</Label><p className="mb-1 text-xs text-muted-foreground">Modelos já testados aparecem primeiro.</p><select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={selected.data.modelId} onChange={(e) => updateSelected({ modelId: e.target.value as ModelId })}>{allowedModelIds.map((id) => <option key={id} value={id}>{MODEL_CATALOG.find((model) => model.id === id)?.label}{testedModels.has(id) ? " · testado" : ""}</option>)}</select></div>}{selected.data.kind !== "output" && <div><Label>{selected.data.kind === "input" ? "Conteúdo" : "Instrução"}</Label><Textarea rows={8} placeholder={selectedHelp?.example.replace("Ex.: ", "")} value={selected.data.prompt} onChange={(e) => updateSelected({ prompt: e.target.value })} /></div>}{selected.data.result && <div><Label>Último resultado</Label><pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{selected.data.result}</pre></div>}</div> : <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground"><Bot className="mb-3 size-8" /><p>Selecione um bloco para configurá-lo.</p></div>}</aside>
      {historyOpen && <aside className="overflow-y-auto border-l bg-background p-4"><h2 className="mb-4 font-semibold">Histórico de execuções</h2>{runs.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma execução ainda.</p> : <div className="space-y-3">{runs.map((run) => <details key={run.id} className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">{new Date(run.createdAt).toLocaleString("pt-BR")} · {run.status === "SUCCESS" ? "Concluído" : "Erro"}</summary><div className="mt-3 space-y-2 text-xs"><p>{run.totalCredits} créditos · {(run.totalLatencyMs / 1000).toFixed(1)}s</p>{run.steps.map((step) => <div key={step.id} className="rounded bg-muted p-2"><strong>{step.label}</strong>{step.modelId && <p>{MODEL_CATALOG.find((model) => model.id === step.modelId)?.label ?? step.modelId}</p>}<pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap">{step.outputText ?? step.errorMessage}</pre></div>)}</div></details>)}</div>}</aside>}
    </div>
  </div>;
}
