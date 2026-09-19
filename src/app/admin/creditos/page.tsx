import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatBRL } from "@/lib/format-currency";
import { getMasterAccountBalance } from "@/lib/openrouter/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const USD_TO_BRL_RATE = 5.13;
/** Abaixo disso, mostra o aviso de recarregar — dá uma folga de alguns dias
 * de uso antes que os clientes sintam. */
const LOW_BALANCE_THRESHOLD_USD = 20;

const PROVIDER_LABEL: Record<string, string> = {
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google AI",
  MARITACA: "Maritaca AI",
};

export default async function CreditosAdminPage() {
  const [balance, recentHistorical] = await Promise.all([
    getMasterAccountBalance().catch(() => null),
    prisma.providerCreditAllocation.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const remainingUSD = balance ? balance.totalCreditsUSD - balance.totalUsageUSD : null;
  const isLow = remainingUSD !== null && remainingUSD < LOW_BALANCE_THRESHOLD_USD;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold">Saldo no OpenRouter</h2>
        <p className="text-sm text-muted-foreground">
          Toda execução de modelo (OpenAI, Anthropic, Google, GPT-OSS) sai desse saldo único —
          recarregue direto no dashboard do OpenRouter quando estiver baixo.
        </p>
      </div>

      {!balance ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Não foi possível consultar o saldo agora — confira se{" "}
            <code className="rounded bg-muted px-1 py-0.5">OPENROUTER_PROVISIONING_KEY</code> está
            configurada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className={isLow ? "border-destructive" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Saldo disponível
                {isLow && <AlertTriangle className="size-4 text-destructive" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatBRL(remainingUSD! * USD_TO_BRL_RATE)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">US$ {remainingUSD!.toFixed(2)}</p>
              {isLow && (
                <p className="mt-2 text-sm text-destructive">
                  Abaixo de US$ {LOW_BALANCE_THRESHOLD_USD} — recarregue no dashboard do
                  OpenRouter.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total depositado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatBRL(balance.totalCreditsUSD * USD_TO_BRL_RATE)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                US$ {balance.totalCreditsUSD.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total usado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatBRL(balance.totalUsageUSD * USD_TO_BRL_RATE)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                US$ {balance.totalUsageUSD.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {recentHistorical.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Histórico de recargas (antes da migração pro OpenRouter)
          </h3>
          <div className="flex flex-col gap-2">
            {recentHistorical.map((allocation) => (
              <div
                key={allocation.id}
                className="flex items-center justify-between rounded-lg border bg-background px-4 py-2.5 text-sm"
              >
                <span>{PROVIDER_LABEL[allocation.provider] ?? allocation.provider}</span>
                <span className="text-muted-foreground">{allocation.user.email}</span>
                <span className="font-medium">{formatBRL(allocation.amountInCents / 100)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
