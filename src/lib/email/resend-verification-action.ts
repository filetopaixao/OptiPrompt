"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { sendVerificationEmail } from "./send-verification-email";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function resendVerificationEmail(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, name: true, emailVerifiedAt: true },
  });

  if (user.emailVerifiedAt) {
    return { ok: false, error: "Seu e-mail já está confirmado." };
  }

  await sendVerificationEmail(userId, user.email, user.name);
  return { ok: true };
}
