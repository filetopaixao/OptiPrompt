import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ProjectsManager } from "../projects-manager";

vi.mock("@/app/app/projects/actions", () => ({
  createProject: vi.fn(), removeProject: vi.fn(), createCollaboratorUser: vi.fn(), removeCollaboratorUser: vi.fn(),
}));

it("mostra o estado vazio e permite iniciar a criação do primeiro projeto", () => {
  render(<ProjectsManager projects={[]} />);
  expect(screen.getByText("Nenhum projeto ainda. Crie o primeiro acima.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Novo projeto" })).toBeEnabled();
});
