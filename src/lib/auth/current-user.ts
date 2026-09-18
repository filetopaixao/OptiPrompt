import { prisma } from "@/lib/db/prisma";

/**
 * MVP: autenticação real (NextAuth, Clerk, etc.) está fora do escopo desta
 * sessão. Todas as rotas operam sobre o usuário demo criado pelo seed
 * (prisma/seed.ts) até um provedor de auth ser conectado.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@optiprompt.dev" },
    select: { id: true },
  });
  return user.id;
}
