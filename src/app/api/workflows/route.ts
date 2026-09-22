import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getWorkflowAccessContext } from "@/lib/workflows/access";
import { createWorkflowSchema } from "@/lib/workflows/schema";

export async function GET() {
  const userId = await getCurrentUserId();
  const context = await getWorkflowAccessContext(userId);
  const workflows = await prisma.workflowProject.findMany({
    where: {
      OR: [
        { userId },
        ...(context.projectId ? [{ projectId: context.projectId }] : []),
        ...(context.ownedProjects.length ? [{ projectId: { in: context.ownedProjects.map((p) => p.id) } }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } }, runs: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true, createdAt: true } } },
  });
  return NextResponse.json({ workflows });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  const parsed = createWorkflowSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Workflow inválido." }, { status: 400 });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { projectId: true, ownedProjects: { select: { id: true } } } });
  const projectId = parsed.data.projectId ?? user.projectId;
  const allowedProjectIds = new Set([user.projectId, ...user.ownedProjects.map((project) => project.id)].filter(Boolean));
  if (projectId && !allowedProjectIds.has(projectId)) return NextResponse.json({ error: "Projeto de colaboração inválido." }, { status: 403 });
  const workflow = await prisma.workflowProject.create({
    data: { userId, projectId, name: parsed.data.name, nodes: parsed.data.nodes, edges: parsed.data.edges },
  });
  return NextResponse.json({ workflow }, { status: 201 });
}
