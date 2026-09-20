import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { prisma } from "@/lib/db/prisma";
import { ClientsManager } from "@/components/clients/clients-manager";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  // Feature exclusiva de quem realmente é dono da assinatura Enterprise —
  // um cliente já gerido não pode gerenciar outros clientes.
  const { planSlug, isManagedAccount } = await requireActiveSubscription();
  if (planSlug !== "agencia" || isManagedAccount) {
    redirect("/app");
  }

  const userId = await getCurrentUserId();
  const clients = await prisma.user.findMany({
    where: { managedByUserId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true, mustChangePassword: true },
  });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
      <p className="mt-1 text-muted-foreground">
        Crie logins pra sua carteira de clientes acessarem a plataforma. Todos compartilham os
        créditos, o plano e a chave de modelos da sua conta — o histórico de execuções continua
        separado por login.
      </p>
      <ClientsManager
        clients={clients.map((client) => ({ ...client, createdAt: client.createdAt.toISOString() }))}
      />
    </div>
  );
}
