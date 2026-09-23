import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { FREE_PLAN_SLUG } from "@/lib/plans/free-tier";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail. Faça login." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Todo cadastro autoatendimento começa no plano Free (perpétuo, 1
  // execução/dia — ver src/lib/plans/free-tier.ts) sem precisar de cartão.
  // Contas criadas pelo admin (ver admin/usuarios) continuam sem plano até
  // ele atribuir uma, esse auto-atribuição é só pro fluxo público de
  // /cadastro.
  const freePlan = await prisma.plan.findUnique({ where: { slug: FREE_PLAN_SLUG } });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      planId: freePlan?.id,
      subscriptionStatus: freePlan ? "ACTIVE" : "INACTIVE",
    },
  });

  // Não bloqueia o cadastro se o envio falhar (ex.: Resend não configurado
  // ainda) — verificação de e-mail só é exigida na hora de rodar a
  // execução Free, não no cadastro em si.
  try {
    await sendVerificationEmail(user.id, user.email, user.name);
  } catch (error) {
    console.error("Falha ao enviar e-mail de verificação:", error);
  }

  return NextResponse.json({ ok: true });
}
