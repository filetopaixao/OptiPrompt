import Link from "next/link";
import { notFound } from "next/navigation";
import { listPlans } from "@/lib/plans";
import { formatBRL } from "@/lib/format-currency";
import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/brand/logo";

export const dynamic = "force-dynamic";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  const plans = await listPlans();
  const plan = plans.find((p) => p.slug === plano) ?? plans[0];

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
