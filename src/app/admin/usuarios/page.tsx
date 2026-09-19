import { Zap } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreateUserDialog } from "./create-user-dialog";
import { ManageUserDialog } from "./manage-user-dialog";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  PAST_DUE: "Em atraso",
  CANCELED: "Cancelada",
  INACTIVE: "Inativa",
};

export default async function UsuariosAdminPage() {
  const [users, plans] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        creditsUsedThisCycle: true,
        bonusCredits: true,
        plan: { select: { id: true, name: true, priceInCents: true } },
      },
    }),
    prisma.plan.findMany({ orderBy: { priceInCents: "asc" } }),
  ]);

  const planOptions = plans.map((plan) => ({ id: plan.id, name: plan.name }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} conta{users.length === 1 ? "" : "s"} cadastrada
            {users.length === 1 ? "" : "s"}
          </p>
        </div>
        <CreateUserDialog plans={planOptions} />
      </div>

      <div className="flex flex-col gap-2">
        {users.map((user) => {
          const creditLimit = user.plan ? getMonthlyCreditLimit(user.plan.priceInCents) : 0;
          const creditsTotal = creditLimit + user.bonusCredits;
          // Mesma convenção do dashboard do usuário (disponível/total) — o
          // formato antigo (usado/total) causava confusão por parecer um
          // valor diferente do que o próprio usuário via logado.
          const creditsAvailable = Math.max(0, creditsTotal - user.creditsUsedThisCycle);

          return (
            <Card key={user.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 basis-52">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name || user.email}</span>
                    <Badge variant={user.subscriptionStatus === "ACTIVE" ? "default" : "secondary"}>
                      {STATUS_LABEL[user.subscriptionStatus]}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="text-sm text-muted-foreground">{user.plan?.name ?? "Sem plano"}</div>

                <div className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                  <Zap className="size-3.5" />
                  {creditsAvailable.toLocaleString("pt-BR")} / {creditsTotal.toLocaleString("pt-BR")}
                </div>

                <ManageUserDialog
                  user={{
                    id: user.id,
                    email: user.email,
                    planId: user.plan?.id ?? "",
                    subscriptionStatus: user.subscriptionStatus,
                    bonusCredits: user.bonusCredits,
                  }}
                  plans={planOptions}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
