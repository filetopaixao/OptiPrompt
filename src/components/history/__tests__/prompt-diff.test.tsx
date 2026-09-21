import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptDiff } from "../prompt-diff";

describe("PromptDiff", () => {
  it("representa um campo vazio sem ruído visual", () => {
    render(<PromptDiff before="" after="" />);
    expect(screen.getByText("(vazio)")).toBeInTheDocument();
  });

  it("destaca palavras removidas e adicionadas", () => {
    render(<PromptDiff before="texto antigo" after="texto novo" />);
    expect(screen.getByText("antigo")).toHaveClass("line-through");
    expect(screen.getByText("novo")).toHaveClass("bg-emerald-200/70");
  });
});
