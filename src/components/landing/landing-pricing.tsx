import { Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { PlanSummary } from "@/lib/plans";
import { CheckoutButton } from "./checkout-button";

const PLAN_TEST_ESTIMATE: Record<string, string> = {
  starter: "≅ 1.000 testes de prompts/mês*",
  pro: "≅ 2.500 testes de prompts/mês*",
  agencia: "≅ 6.000 testes de prompts/mês*",
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["Comparação simultânea em até 4 modelos", "Histórico de execuções", "Relatório PDF exportável"],
  pro: [
    "Tudo do Starter",
    "Todos os modelos e provedores liberados",
    "Projeção de custo em escala",
    "Suporte prioritário",
  ],
  agencia: [
    "Tudo do Agência (Pro)",
    "Relatórios whitelabel com logo da sua agência",
    "Múltiplos clientes/projetos",
    "Onboarding dedicado",
  ],
};

export function LandingPricing({ plans }: { plans: PlanSummary[] }) {
  const highlightedSlug = "pro";

  return (
    <section id="planos" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Planos para agências que levam custo a sério</h2>
        <p className="mt-2 text-muted-foreground">
          Escolha o plano — o custo real de cada execução já está incluso, sem surpresa na fatura.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isHighlighted = plan.slug === highlightedSlug;
          return (
            <Card
              key={plan.id}
              className={cn("h-full", isHighlighted && "border-primary shadow-lg shadow-primary/10")}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isHighlighted && <Badge>Recomendado</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{formatBRL(plan.priceInCents / 100)}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                  <Zap className="size-3.5" />
                  {plan.monthlyCreditLimit.toLocaleString("pt-BR")} créditos de IA
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-start gap-2 font-medium">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {PLAN_TEST_ESTIMATE[plan.slug]}
                  </li>
                  {(PLAN_FEATURES[plan.slug] ?? []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <CheckoutButton planSlug={plan.slug} label="Assinar agora" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        * Os créditos são renovados a cada ciclo de faturamento mensal e não são cumulativos para o
        mês seguinte.
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        * O volume de testes estimado varia conforme o tamanho do prompt e os provedores
        escolhidos (modelos premium como GPT-4o e Claude 3.5 Sonnet consomem mais créditos por
        execução).
      </p>
    </section>
  );
}
