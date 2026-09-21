import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ExecutionResultDTO } from "@/types/execution";
import { ReportVerdict } from "../report-verdict";

const result = (id: string, modelId: string, latencyMs: number, cost: number): ExecutionResultDTO => ({
  id, modelId, latencyMs, estimatedCostInBRL: cost, provider: "OPENAI", tier: "PREMIUM",
  status: "SUCCESS", responseText: "ok", errorMessage: null, promptTokens: 10,
  completionTokens: 10, estimatedCostInCredits: 1, ruleVerdict: null, ruleReason: null,
});

describe("ReportVerdict", () => {
  it("não declara vencedor com menos de duas respostas válidas", () => {
    const { container } = render(<ReportVerdict results={[result("1", "openai/gpt-4o", 100, 0.1)]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("apresenta vencedores de preço e velocidade", () => {
    render(<ReportVerdict results={[
      result("1", "openai/gpt-4o", 100, 0.2),
      result("2", "openai/gpt-4o-mini", 200, 0.1),
    ]} />);
    expect(screen.getByText("Mais barato")).toBeInTheDocument();
    expect(screen.getByText("Mais rápido")).toBeInTheDocument();
    expect(screen.getAllByText(/GPT-4o/)).toHaveLength(4);
  });
});
