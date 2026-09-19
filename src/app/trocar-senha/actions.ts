"use server";

import bcrypt from "bcryptjs";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

export async function changePassword(
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const userId = await getCurrentUserId();
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  return { ok: true };
}
