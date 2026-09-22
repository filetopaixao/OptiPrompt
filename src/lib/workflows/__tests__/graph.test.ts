import { describe, expect, it } from "vitest";
import { topologicalOrder, transformWorkflowValue } from "../graph";
import type { WorkflowEdge, WorkflowNode } from "../types";

const node = (id: string): WorkflowNode => ({ id, type: "input", position: { x: 0, y: 0 }, data: { kind: "input", label: id, description: "", prompt: "", modelId: "", status: "idle" } });

describe("topologicalOrder", () => {
  it("ordena dependências antes dos consumidores", () => {
    const nodes = [node("output"), node("input"), node("agent")];
    const edges: WorkflowEdge[] = [{ id: "1", source: "input", target: "agent" }, { id: "2", source: "agent", target: "output" }];
    expect(topologicalOrder(nodes, edges).map((item) => item.id)).toEqual(["input", "agent", "output"]);
  });

  it("recusa ciclos", () => {
    expect(() => topologicalOrder([node("a"), node("b")], [{ id: "1", source: "a", target: "b" }, { id: "2", source: "b", target: "a" }])).toThrow("ciclo");
  });
});

describe("transformWorkflowValue", () => {
  it("suporta transformações determinísticas", () => {
    expect(transformWorkflowValue("Texto", "converta para maiúsculas")).toBe("TEXTO");
    expect(transformWorkflowValue("Texto", "converta para minúsculas")).toBe("texto");
    expect(JSON.parse(transformWorkflowValue("Texto", "retorne json"))).toEqual({ result: "Texto" });
  });
});
