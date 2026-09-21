import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingBenefits } from "../landing-benefits";
import { LandingFooter } from "../landing-footer";

describe("conteúdo institucional", () => {
  it("expõe os três benefícios centrais", () => {
    render(<LandingBenefits />);
    expect(screen.getByText("Custo Transparente por Chamada e Modelo")).toBeInTheDocument();
    expect(screen.getByText("Latência e Tempo de Resposta")).toBeInTheDocument();
    expect(screen.getByText("Teste A/B de Prompts em Produção")).toBeInTheDocument();
  });

  it("oferece um contato externo seguro", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("rel", "noopener noreferrer");
  });
});
