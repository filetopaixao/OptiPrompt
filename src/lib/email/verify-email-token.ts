import { prisma } from "@/lib/db/prisma";

export type VerifyEmailResult = "verified" | "already-verified" | "invalid" | "expired";

/** Consome um token de verificação — marca User.emailVerifiedAt e apaga o
 * token (uso único). Idempotente o bastante pra não quebrar se o usuário
 * clicar no link duas vezes (segunda vez cai em "already-verified" porque
 * o token já foi apagado, não é tratado como erro). */
export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!record) {
    return "invalid";
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return "expired";
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return "verified";
}
