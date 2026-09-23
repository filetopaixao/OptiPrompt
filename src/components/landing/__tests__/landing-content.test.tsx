import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingBenefits } from "../landing-benefits";
import { LandingFooter } from "../landing-footer";

describe("conteúdo institucional", () => {
  it("expõe os diferenciais centrais", () => {
    render(<LandingBenefits />);
    expect(screen.getByText("Sem administrar chaves de vários provedores")).toBeInTheDocument();
    expect(screen.getByText("Benchmarks persistentes")).toBeInTheDocument();
    expect(screen.getByText("Projetos isolados por cliente")).toBeInTheDocument();
  });

  it("oferece um contato externo seguro", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("rel", "noopener noreferrer");
  });
});
