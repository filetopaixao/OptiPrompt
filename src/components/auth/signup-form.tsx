"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ planSlug }: { planSlug: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        toast.error(signupData.error ?? "Não foi possível criar a conta.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Conta criada, mas o login automático falhou. Entre manualmente.");
        router.push("/login");
        return;
      }

      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      // Se a sessão recém-criada não foi reconhecida (ex.: cookie ainda não
      // propagado), getCurrentUserId() redireciona pro /login — o fetch segue
      // esse redirect e devolve a página HTML de login em vez de JSON, o que
      // faria response.json() explodir e cair no catch genérico de "erro de
      // rede", mascarando o problema real. Detecta isso pelo content-type.
      const isJson = checkoutResponse.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        toast.error("Conta criada! Faça login para continuar para o pagamento.");
        router.push("/login");
        return;
      }

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        toast.error(checkoutData.error ?? "Checkout ainda não está disponível.");
        router.push("/app");
        return;
      }

      window.location.href = checkoutData.checkoutUrl;
    } catch {
      toast.error("Erro de rede. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="mt-2">
        {isLoading && <Loader2 className="animate-spin" />}
        Criar conta e continuar para o pagamento
      </Button>
    </form>
  );
}
