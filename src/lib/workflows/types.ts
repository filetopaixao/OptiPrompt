import type { Edge, Node } from "@xyflow/react";
import type { ModelId } from "@/types/models";

export type WorkflowNodeKind = "input" | "llm" | "transform" | "output";
export type WorkflowNodeStatus = "idle" | "running" | "success" | "error";

export interface WorkflowNodeData extends Record<string, unknown> {
  kind: WorkflowNodeKind;
  label: string;
  description: string;
  prompt: string;
  modelId: ModelId | "";
  status: WorkflowNodeStatus;
  result?: string;
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeKind>;
export type WorkflowEdge = Edge;

export interface WorkflowRunDTO {
  id: string;
  status: string;
  finalOutput: string | null;
  errorMessage: string | null;
  totalCredits: number;
  totalLatencyMs: number;
  createdAt: string;
  completedAt: string | null;
  steps: Array<{
    id: string;
    nodeId: string;
    kind: string;
    label: string;
    modelId: string | null;
    status: string;
    inputText: string | null;
    outputText: string | null;
    errorMessage: string | null;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    estimatedCostInCredits: number;
  }>;
}

export interface WorkflowProjectDTO {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  runs?: WorkflowRunDTO[];
}
