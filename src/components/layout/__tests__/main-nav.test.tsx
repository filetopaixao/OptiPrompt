import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MainNav } from "../main-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/app/history" }));

it("marca a rota ativa e mostra Projetos somente quando permitido", () => {
  const { rerender } = render(<MainNav />);
  expect(screen.getByRole("link", { name: "Histórico" })).toHaveClass("bg-secondary");
  expect(screen.queryByRole("link", { name: "Projetos" })).not.toBeInTheDocument();
  rerender(<MainNav showProjects />);
  expect(screen.getByRole("link", { name: "Projetos" })).toHaveAttribute("href", "/app/projects");
});
