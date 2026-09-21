import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "../signup-form";

const { signIn, push, toastError } = vi.hoisted(() => ({ signIn: vi.fn(), push: vi.fn(), toastError: vi.fn() }));
vi.mock("next-auth/react", () => ({ signIn }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

describe("SignupForm", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", vi.fn()); });

  it("interrompe o fluxo e informa o erro de cadastro", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: "E-mail já cadastrado" }), {
      status: 409, headers: { "content-type": "application/json" },
    }));
    const user = userEvent.setup();
    render(<SignupForm planSlug="pro" />);
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "segredo123");
    await user.click(screen.getByRole("button", { name: /Criar conta/ }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("E-mail já cadastrado"));
    expect(signIn).not.toHaveBeenCalled();
  });

  it("envia o plano escolhido ao checkout", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user-1" }), { status: 201, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "indisponível" }), { status: 503, headers: { "content-type": "application/json" } }));
    signIn.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<SignupForm planSlug="agencia" />);
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "segredo123");
    await user.click(screen.getByRole("button", { name: /Criar conta/ }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith("/api/stripe/checkout", expect.objectContaining({ body: JSON.stringify({ planSlug: "agencia" }) }));
    expect(push).toHaveBeenCalledWith("/app");
  });
});
