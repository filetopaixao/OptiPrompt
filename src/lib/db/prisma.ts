import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton do PrismaClient — evita esgotar conexões durante hot-reload
 * no `next dev`, onde os módulos são recarregados a cada mudança.
 *
 * `import "server-only"` falha o build com um erro claro se algum client
 * component importar este arquivo (mesmo transitivamente, através de outro
 * módulo) — sem isso, o erro só aparece em runtime no navegador como
 * "Module not found: Can't resolve 'dns'/'fs'/'net'" (o driver `pg` sendo
 * arrastado pro bundle do cliente), bem mais difícil de diagnosticar.
 *
 * Prisma 7 exige um driver adapter explícito em runtime (a URL em
 * prisma.config.ts só é usada por Migrate/Studio).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || typeof connectionString !== "string") {
    throw new Error(
      "DATABASE_URL não está configurada. Copie .env.example para .env e informe a conexão PostgreSQL.",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
