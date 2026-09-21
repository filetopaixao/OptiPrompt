import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AuthSessionProvider } from "../session-provider";

vi.mock("next-auth/react", () => ({ SessionProvider: ({ children }: { children: React.ReactNode }) => <section data-testid="session">{children}</section> }));

it("disponibiliza a sessão aos componentes filhos", () => {
  render(<AuthSessionProvider><span>Área privada</span></AuthSessionProvider>);
  expect(screen.getByTestId("session")).toContainElement(screen.getByText("Área privada"));
});
