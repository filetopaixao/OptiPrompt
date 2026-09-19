import { prisma } from "@/lib/db/prisma";
import { formatBRL } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markProviderAllocationsCompleted } from "./actions";

export const dynamic = "force-dynamic";

const PROVIDERS = ["ANTHROPIC", "GOOGLE", "MARITACA"] as const;

const PROVIDER_LABEL: Record<(typeof PROVIDERS)[number], string> = {
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google AI",
  MARITACA: "Maritaca AI",
};

export default async function CreditosAdminPage() {
  const pending = await prisma.providerCreditAllocation.groupBy({
    by: ["provider"],
    where: { status: "PENDING" },
    _sum: { amountInCents: true },
    _count: true,
  });

  const recentCompleted = await prisma.providerCreditAllocation.findMany({
    where: { status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold">Recarga pendente nos provedores</h2>
        <p className="text-sm text-muted-foreground">
          20% de cada pagamento de assinatura confirmado, dividido em partes iguais entre os
          três provedores. Nenhum expõe API de recarga de saldo — confirme aqui só depois de
          recarregar manualmente no painel de cada um.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PROVIDERS.map((provider) => {
          const entry = pending.find((p) => p.provider === provider);
          const totalInCents = entry?._sum.amountInCents ?? 0;
          const count = entry?._count ?? 0;

          return (
            <Card key={provider}>
              <CardHeader>
                <CardTitle>{PROVIDER_LABEL[provider]}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-2xl font-semibold">{formatBRL(totalInCents / 100)}</div>
                <p className="text-sm text-muted-foreground">
                  {count} pagamento{count === 1 ? "" : "s"} pendente{count === 1 ? "" : "s"}
                </p>
                <form action={markProviderAllocationsCompleted.bind(null, provider)}>
                  <Button type="submit" disabled={totalInCents === 0} className="w-full">
                    Marcar como recarregado
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Últimas recargas confirmadas
        </h3>
        <div className="flex flex-col gap-2">
          {recentCompleted.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma recarga confirmada ainda.</p>
          )}
          {recentCompleted.map((allocation) => (
            <div
              key={allocation.id}
              className="flex items-center justify-between rounded-lg border bg-background px-4 py-2.5 text-sm"
            >
              <span>{PROVIDER_LABEL[allocation.provider]}</span>
              <span className="text-muted-foreground">{allocation.user.email}</span>
              <span className="font-medium">{formatBRL(allocation.amountInCents / 100)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
