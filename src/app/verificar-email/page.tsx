import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { verifyEmailToken } from "@/lib/email/verify-email-token";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { title: string; description: string; icon: "ok" | "error" }> = {
  verified: {
    title: "E-mail confirmado!",
    description: "Sua execução gratuita diária já está liberada.",
    icon: "ok",
  },
  "already-verified": {
    title: "E-mail já confirmado",
    description: "Esse link já foi usado antes — sua conta já está verificada.",
    icon: "ok",
  },
  expired: {
    title: "Link expirado",
    description: "Esse link de verificação venceu. Peça um novo em Configurações, depois de entrar.",
    icon: "error",
  },
  invalid: {
    title: "Link inválido",
    description: "Esse link de verificação não é válido. Peça um novo em Configurações.",
    icon: "error",
  },
};

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailToken(token) : "invalid";
  const message = MESSAGES[result] ?? MESSAGES.invalid;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 text-center shadow-sm">
        <Logo className="mx-auto mb-6" />
        {message.icon === "ok" ? (
          <CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-500" />
        ) : (
          <XCircle className="mx-auto mb-3 size-10 text-destructive" />
        )}
        <h1 className="text-xl font-semibold tracking-tight">{message.title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">{message.description}</p>
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Entrar
        </Link>
      </div>
    </div>
  );
}
