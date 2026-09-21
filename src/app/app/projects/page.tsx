import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { prisma } from "@/lib/db/prisma";
import { ProjectsManager } from "@/components/projects/projects-manager";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Feature exclusiva de quem realmente é dono da assinatura Enterprise —
  // um colaborador já vinculado a um projeto não pode gerenciar projetos.
  const { planSlug, isManagedAccount } = await requireActiveSubscription();
  if (planSlug !== "agencia" || isManagedAccount) {
    redirect("/app");
  }

  const userId = await getCurrentUserId();
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    include: {
      members: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true, mustChangePassword: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
      <p className="mt-1 text-muted-foreground">
        Crie projetos e adicione colaboradores a cada um. Todos compartilham os créditos, o plano
        e a chave de modelos da sua conta — o histórico de execuções é compartilhado entre
        colaboradores do mesmo projeto, mas isolado de outros projetos.
      </p>
      <ProjectsManager
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          members: project.members.map((member) => ({
            ...member,
            createdAt: member.createdAt.toISOString(),
          })),
        }))}
      />
    </div>
  );
}
