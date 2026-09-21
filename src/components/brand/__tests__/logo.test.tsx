import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Logo } from "../logo";

it("renderiza o logo com link configurável", () => {
  const { rerender } = render(<Logo href="/app" size={40} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/app");
  expect(screen.getByAltText("OtimizaIA")).toHaveAttribute("width", "40");
  rerender(<Logo href={false} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
