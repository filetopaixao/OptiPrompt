import { Zap } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { listPlans } from "@/lib/plans";
import { formatBRL } from "@/lib/format-currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const userId = await getCurrentUserId();
  const [user, plans] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: { select: { slug: true } } },
    }),
    listPlans(),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Planos e créditos</h1>
      <p className="mt-1 text-muted-foreground">
        Escolha o plano da sua agência — os créditos são renovados a cada ciclo de faturamento.
      </p>

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
    </div>
  );
}
