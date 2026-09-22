import Link from "next/link";
import { Bot, Clock3, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkflowButton } from "@/components/workflows/create-workflow-button";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getWorkflowAccessContext } from "@/lib/workflows/access";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const userId = await getCurrentUserId();
  const context = await getWorkflowAccessContext(userId);
  const workflows = await prisma.workflowProject.findMany({
    where: { OR: [{ userId }, ...(context.projectId ? [{ projectId: context.projectId }] : []), ...(context.ownedProjects.length ? [{ projectId: { in: context.ownedProjects.map((project) => project.id) } }] : [])] },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } }, runs: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true, createdAt: true } }, project: { select: { name: true } } },
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { project: { select: { id: true, name: true } }, ownedProjects: { select: { id: true, name: true }, orderBy: { name: "asc" } } } });
  const projectOptions = user.project ? [user.project] : user.ownedProjects;

  return <div className="mx-auto max-w-6xl p-4 sm:p-6">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">Workflow Builder</h1><p className="mt-1 text-sm text-muted-foreground">Combine os modelos testados em processos reutilizáveis e acompanhe cada execução.</p></div><CreateWorkflowButton projects={projectOptions} /></div>
    {workflows.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed text-center"><Bot className="mb-3 size-10 text-muted-foreground" /><h2 className="font-semibold">Crie seu primeiro workflow</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">Conecte entradas, agentes e transformações para produzir resultados consistentes.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{workflows.map((workflow) => <Link href={`/app/workflows/${workflow.id}`} key={workflow.id}><Card className="h-full transition-colors hover:border-primary/50"><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="size-4 text-primary" />{workflow.name}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground">{workflow.project && <p>Projeto: {workflow.project.name}</p>}<p className="flex items-center gap-2"><History className="size-4" />{workflow._count.runs} execuções</p><p className="flex items-center gap-2"><Clock3 className="size-4" />Atualizado em {workflow.updatedAt.toLocaleDateString("pt-BR")}</p>{workflow.runs[0] && <p className={workflow.runs[0].status === "SUCCESS" ? "text-emerald-600" : "text-destructive"}>Última execução: {workflow.runs[0].status === "SUCCESS" ? "concluída" : "com erro"}</p>}</CardContent></Card></Link>)}</div>}
  </div>;
}
