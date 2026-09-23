import Link from "next/link";
import { notFound } from "next/navigation";
import { listPlans } from "@/lib/plans";
import { formatBRL } from "@/lib/format-currency";
import { FREE_PLAN_SLUG } from "@/lib/plans/free-tier";
import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/brand/logo";

export const dynamic = "force-dynamic";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;

  // Sem plano escolhido (ex.: CTA "Testar gratuitamente" do Hero) ou
  // plano=free explícito: cadastro autoatendimento no plano Free, sem
  // passar pelo Stripe — o plano já é atribuído automaticamente no servidor
  // (ver /api/auth/signup). Sem isso, cair aqui sem plano escolhido
  // acabava assinando o plano pago mais barato sem querer.
  if (!plano || plano === FREE_PLAN_SLUG) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
          <Logo className="mb-6" />
          <h1 className="text-xl font-semibold tracking-tight">Crie sua conta gratuita</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            1 execução real por dia via OpenRouter, sem cartão e sem cadastrar chave de nenhum
            provedor. Confirme seu e-mail para liberá-la.
          </p>
          <SignupForm planSlug={FREE_PLAN_SLUG} skipCheckout />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const plans = await listPlans();
  const plan = plans.find((p) => p.slug === plano);
  if (!plan) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="text-xl font-semibold tracking-tight">Crie sua conta</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Plano {plan.name} — {formatBRL(plan.priceInCents / 100)}/mês. Você será redirecionado
          para o pagamento em seguida.
        </p>
        <SignupForm planSlug={plan.slug} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
