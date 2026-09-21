import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../login-form";

const { signIn, push, refresh, toastError } = vi.hoisted(() => ({
  signIn: vi.fn(), push: vi.fn(), refresh: vi.fn(), toastError: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ signIn }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams("callbackUrl=/app/history"),
}));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("envia as credenciais e respeita a URL de retorno", async () => {
    signIn.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "segredo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "ana@example.com", password: "segredo123", redirect: false,
    }));
    expect(push).toHaveBeenCalledWith("/app/history");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("exibe o erro devolvido pela autenticação", async () => {
    signIn.mockResolvedValue({ error: "CredentialsSignin" });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "incorreta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("E-mail ou senha inválidos."));
    expect(push).not.toHaveBeenCalled();
  });
});
