import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionRequiredBanner } from "../subscription-required-banner";

describe("SubscriptionRequiredBanner", () => {
  it.each([
    ["trial" as const, "teste grátis de 7 dias acabou"],
    ["pagamento" as const, "pagamento não foi concluído"],
  ])("explica o bloqueio por %s", (reason, message) => {
    render(<SubscriptionRequiredBanner reason={reason} />);
    expect(screen.getByText(new RegExp(message))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver planos" })).toHaveAttribute("href", "#planos");
  });
});
