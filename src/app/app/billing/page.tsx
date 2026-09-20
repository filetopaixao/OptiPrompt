import { PackagePlus, Zap } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { prisma } from "@/lib/db/prisma";
import { listPlans } from "@/lib/plans";
import { formatBRL } from "@/lib/format-currency";
import { CREDIT_PACK_AMOUNT } from "@/lib/credits/credit-pack";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { CreditPackButton } from "@/components/dashboard/credit-pack-button";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  // Conta de cliente gerida por uma agência Enterprise (ver
  // User.managedByUserId): não tem assinatura própria pra gerenciar aqui —
  // plano, créditos e cancelamento são todos da agência.
  const { isManagedAccount } = await requireActiveSubscription();
  if (isManagedAccount) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Planos e créditos</h1>
        <p className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Sua conta é gerida por uma agência — plano, créditos e cobrança são administrados por
          quem te deu acesso à plataforma. Fale com o administrador da sua conta pra qualquer
          dúvida sobre assinatura ou créditos.
        </p>
      </div>
    );
  }

  const userId = await getCurrentUserId();
  const [user, plans] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        bonusCredits: true,
        subscriptionStatus: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
        plan: { select: { slug: true } },
      },
    }),
    listPlans(),
  ]);

  const canBuyCredits = user.subscriptionStatus === "ACTIVE" && !user.cancelAtPeriodEnd;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Planos e créditos</h1>
      <p className="mt-1 text-muted-foreground">
        Escolha o plano da sua agência — os créditos são renovados a cada ciclo de faturamento.
      </p>

      {user.cancelAtPeriodEnd && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          Sua assinatura está com cancelamento agendado para{" "}
          <strong>
            {user.currentPeriodEnd
              ? user.currentPeriodEnd.toLocaleDateString("pt-BR")
              : "o fim do ciclo atual"}
          </strong>
          . Até lá você mantém acesso total e os créditos do seu plano, mas não é possível comprar
          pacotes avulsos.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.slug === user.plan?.slug;
          return (
            <Card key={plan.id} className={isCurrent ? "border-primary shadow-sm" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Plano atual</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{formatBRL(plan.priceInCents / 100)}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                  <Zap className="size-3.5" />
                  {plan.monthlyCreditLimit.toLocaleString("pt-BR")} créditos de IA
                </div>
              </CardHeader>
              <CardContent>
                <UpgradeButton planSlug={plan.slug} disabled={isCurrent} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Crédito avulso</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Precisa de mais fôlego neste ciclo? Compre um pacote extra — não vence, fica disponível
          até ser usado.
          {user.bonusCredits > 0 && (
            <> Você tem <strong className="text-foreground">{user.bonusCredits.toLocaleString("pt-BR")}</strong> créditos avulsos ativos.</>
          )}
        </p>

        <Card className="mt-4 max-w-sm">
          <CardHeader>
            <CardTitle>Pacote de créditos</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{formatBRL(39)}</span>
              <span className="text-sm text-muted-foreground">pagamento único</span>
            </div>
            <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
              <PackagePlus className="size-3.5" />
              +{CREDIT_PACK_AMOUNT.toLocaleString("pt-BR")} créditos
            </div>
          </CardHeader>
          <CardContent>
            <CreditPackButton disabled={!canBuyCredits} />
          </CardContent>
        </Card>
      </div>

      {user.subscriptionStatus === "ACTIVE" && !user.cancelAtPeriodEnd && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Cancelar assinatura</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Você mantém acesso total e os créditos do seu plano até o fim do ciclo já pago — o
            cancelamento não é imediato.
          </p>
          <div className="mt-4">
            <CancelSubscriptionButton currentPeriodEnd={user.currentPeriodEnd?.toISOString() ?? null} />
          </div>
        </div>
      )}
    </div>
  );
}
