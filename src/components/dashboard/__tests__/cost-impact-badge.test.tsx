import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CostImpactBadge } from "../cost-impact-badge";

it.each([
  [1, "Custo baixo"], [10, "Custo médio"], [10_000, "Custo alto"],
])("classifica %s créditos como %s", (credits, label) => {
  render(<CostImpactBadge estimatedCostInCredits={credits} />);
  expect(screen.getByText(label)).toBeInTheDocument();
});
