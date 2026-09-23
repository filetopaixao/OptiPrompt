import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { APP_BASE_URL, EMAIL_FROM, getResendClient } from "./resend-client";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** Gera um token novo, invalida os anteriores do usuário (evita acumular
 * lixo e impede um link antigo de continuar valendo depois de um reenvio)
 * e envia o e-mail de verificação via Resend. Sem RESEND_API_KEY
 * configurada, não lança erro (não bloqueia o cadastro) — só loga o link
 * pro console, útil em dev/teste antes do domínio estar configurado no
 * Resend (ver resumo da Release 1 pra o passo manual pendente).
 */
export async function sendVerificationEmail(userId: string, email: string, name: string | null): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = randomBytes(32).toString("base64url");
  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const verifyUrl = `${APP_BASE_URL}/verificar-email?token=${token}`;

  const client = getResendClient();
  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY não configurada — link de verificação para ${email}: ${verifyUrl}`,
    );
    return;
  }

  await client.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Confirme seu e-mail — OtimizaIA",
    html: `
      <p>Olá${name ? `, ${name}` : ""}!</p>
      <p>Confirme seu e-mail pra liberar sua execução gratuita diária no OtimizaIA:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Esse link expira em 24 horas.</p>
    `,
  });
}
