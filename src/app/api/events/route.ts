import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const eventSchema = z.object({
  name: z.string().min(1).max(80),
  properties: z.record(z.string(), z.unknown()).optional(),
});

/** Log mínimo de eventos de funil (calculadora, cadastro Free, upgrade
 * etc.) — não é uma plataforma de analytics, só uma tabela de log simples.
 * Sem sessão, `userId` fica null (ex.: eventos da landing antes do
 * cadastro) — nunca bloqueia nem falha por falta de autenticação. */
export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // auth() direto (não getCurrentUserId, que redireciona pro /login quando
  // não há sessão) — eventos da landing acontecem sem usuário logado o
  // tempo todo, isso é esperado, não um erro.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.productEvent.create({
    data: {
      userId,
      name: parsed.data.name,
      properties: parsed.data.properties as Prisma.InputJsonValue | undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
