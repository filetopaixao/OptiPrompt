import type { WorkflowEdge, WorkflowNode } from "./types";

export function topologicalOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const ids = new Set(nodes.map((node) => node.id));
  if (ids.size !== nodes.length) throw new Error("Existem blocos duplicados no workflow.");
  if (edges.some((edge) => !ids.has(edge.source) || !ids.has(edge.target))) {
    throw new Error("O workflow contém uma conexão inválida.");
  }

  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  const queue = nodes.filter((node) => indegree.get(node.id) === 0);
  const ordered: WorkflowNode[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    ordered.push(node);
    for (const edge of edges.filter((item) => item.source === node.id)) {
      const next = (indegree.get(edge.target) ?? 0) - 1;
      indegree.set(edge.target, next);
      if (next === 0) queue.push(nodes.find((item) => item.id === edge.target)!);
    }
  }

  if (ordered.length !== nodes.length) {
    throw new Error("O workflow contém um ciclo. Remova a conexão circular para executar.");
  }
  return ordered;
}

export function transformWorkflowValue(input: string, instruction: string): string {
  const normalized = instruction.trim().toLowerCase();
  if (normalized.includes("json")) return JSON.stringify({ result: input }, null, 2);
  if (normalized.includes("minúscul")) return input.toLowerCase();
  if (normalized.includes("maiúscul")) return input.toUpperCase();
  return input;
}
