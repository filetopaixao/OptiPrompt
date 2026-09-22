"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, Braces, Check, LoaderCircle, LogIn, LogOut, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getModelDefinition } from "@/types/models";
import type { WorkflowNode as WorkflowNodeType, WorkflowNodeKind } from "@/lib/workflows/types";

const meta: Record<WorkflowNodeKind, { label: string; icon: typeof Bot; color: string }> = {
  input: { label: "Entrada", icon: LogIn, color: "border-l-blue-500" },
  llm: { label: "Agente", icon: Bot, color: "border-l-violet-500" },
  transform: { label: "Transformar", icon: Braces, color: "border-l-amber-500" },
  output: { label: "Saída", icon: LogOut, color: "border-l-emerald-500" },
};

export function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeType>) {
  const item = meta[data.kind];
  const Icon = item.icon;
  return <div className={`w-64 rounded-xl border border-l-4 ${item.color} bg-card p-4 shadow-sm ${selected ? "ring-2 ring-primary/40" : ""}`}>
    {data.kind !== "input" && <Handle type="target" position={Position.Left} />}
    <div className="mb-3 flex items-center justify-between"><Icon className="size-4" /><Badge variant="outline">{item.label}</Badge></div>
    <strong className="text-sm">{data.label}</strong>
    <p className="mt-1 text-xs text-muted-foreground">{data.description}</p>
    {data.kind === "llm" && data.modelId && <p className="mt-3 text-xs font-medium text-violet-600">{getModelDefinition(data.modelId).label}</p>}
    {data.status !== "idle" && <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
      {data.status === "running" ? <LoaderCircle className="size-3 animate-spin" /> : data.status === "success" ? <Check className="size-3 text-emerald-600" /> : <TriangleAlert className="size-3 text-destructive" />}
      {data.status === "running" ? "Executando..." : data.status === "success" ? "Concluído" : "Erro"}
    </div>}
    {data.kind !== "output" && <Handle type="source" position={Position.Right} />}
  </div>;
}
