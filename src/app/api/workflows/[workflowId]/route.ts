import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { findAccessibleWorkflow } from "@/lib/workflows/access";
import { workflowGraphSchema } from "@/lib/workflows/schema";

type Context = { params: Promise<{ workflowId: string }> };

export async function GET(_: Request, { params }: Context) {
  const userId = await getCurrentUserId();
  const { workflowId } = await params;
  const accessible = await findAccessibleWorkflow(workflowId, userId);
  if (!accessible) return NextResponse.json({ error: "Workflow não encontrado." }, { status: 404 });
  const workflow = await prisma.workflowProject.findUnique({
    where: { id: workflowId },
    include: { runs: { orderBy: { createdAt: "desc" }, take: 30, include: { steps: { orderBy: { position: "asc" } } } } },
  });
  return NextResponse.json({ workflow });
}

export async function PATCH(request: Request, { params }: Context) {
  const userId = await getCurrentUserId();
  const { workflowId } = await params;
  if (!(await findAccessibleWorkflow(workflowId, userId))) return NextResponse.json({ error: "Workflow não encontrado." }, { status: 404 });
  const parsed = workflowGraphSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Workflow inválido." }, { status: 400 });
  const workflow = await prisma.workflowProject.update({ where: { id: workflowId }, data: parsed.data });
  return NextResponse.json({ workflow });
}

export async function DELETE(_: Request, { params }: Context) {
  const userId = await getCurrentUserId();
  const { workflowId } = await params;
  if (!(await findAccessibleWorkflow(workflowId, userId))) return NextResponse.json({ error: "Workflow não encontrado." }, { status: 404 });
  await prisma.workflowProject.delete({ where: { id: workflowId } });
  return new NextResponse(null, { status: 204 });
}
