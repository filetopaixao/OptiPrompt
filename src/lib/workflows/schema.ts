import { z } from "zod";
import { MODEL_CATALOG } from "@/types/models";

const modelIds = MODEL_CATALOG.map((model) => model.id) as [string, ...string[]];
const positionSchema = z.object({ x: z.number(), y: z.number() });

export const workflowNodeSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(["input", "llm", "transform", "output"]),
  position: positionSchema,
  data: z.object({
    kind: z.enum(["input", "llm", "transform", "output"]),
    label: z.string().min(1).max(120),
    description: z.string().max(300),
    prompt: z.string().max(20_000),
    modelId: z.union([z.enum(modelIds), z.literal("")]),
    status: z.enum(["idle", "running", "success", "error"]).default("idle"),
    result: z.string().max(100_000).optional(),
  }),
}).refine((node) => node.type === node.data.kind, "Tipo de bloco inconsistente.");

export const workflowEdgeSchema = z.object({
  id: z.string().min(1).max(160),
  source: z.string().min(1).max(120),
  target: z.string().min(1).max(120),
  animated: z.boolean().optional(),
});

export const workflowGraphSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nodes: z.array(workflowNodeSchema).max(30),
  edges: z.array(workflowEdgeSchema).max(80),
});

export const createWorkflowSchema = workflowGraphSchema.extend({
  projectId: z.string().cuid().nullable().optional(),
});
