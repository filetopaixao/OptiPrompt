import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Acesse o painel da sua agência.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/#planos" className="font-medium text-primary hover:underline">
            Ver planos
          </Link>
        </p>
      </div>
    </div>
  );
}
