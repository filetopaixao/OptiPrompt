import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ResultsGrid } from "../results-grid";

vi.mock("../model-result-card", () => ({
  ModelResultCard: ({ result, isWinner }: { result: { id: string }; isWinner: boolean }) => <div>{result.id}:{String(isWinner)}</div>,
}));

it("orienta o usuário quando ainda não existe execução", () => {
  render(<ResultsGrid results={[]} pendingModelIds={[]} />);
  expect(screen.getByText(/Preencha o prompt/)).toBeInTheDocument();
});

it("renderiza resultados e espaços reservados pendentes", () => {
  const { container } = render(<ResultsGrid results={[{ id: "r1" } as never]} pendingModelIds={["openai/gpt-4.1" as never]} winnerId="r1" />);
  expect(screen.getByText("r1:true")).toBeInTheDocument();
  expect(container.querySelectorAll("[data-slot=skeleton]")).toHaveLength(4);
});
