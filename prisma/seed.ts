import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // monthlyCreditLimit não é mais armazenado — é 20% do priceInCents,
  // derivado em runtime por getMonthlyCreditLimit() (credit-converter.ts).
  // Slugs ficam estáveis (referenciados pelos STRIPE_PRICE_ID_* e pelo
  // checkout) mesmo quando o nome/preço comercial muda.
  const starter = await prisma.plan.upsert({
    where: { slug: "starter" },
    update: { name: "Starter", priceInCents: 9700 },
    create: { name: "Starter", slug: "starter", priceInCents: 9700 },
  });

  const pro = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: { name: "Agência (Pro)", priceInCents: 24700 },
    create: { name: "Agência (Pro)", slug: "pro", priceInCents: 24700 },
  });

  const agencia = await prisma.plan.upsert({
    where: { slug: "agencia" },
    update: { name: "Enterprise", priceInCents: 59700 },
    create: { name: "Enterprise", slug: "agencia", priceInCents: 59700 },
  });

  await prisma.user.upsert({
    where: { email: "demo@optiprompt.dev" },
    update: { subscriptionStatus: "ACTIVE", creditsUsedThisCycle: 18_000 },
    create: {
      email: "demo@optiprompt.dev",
      name: "Usuário Demo",
      planId: pro.id,
      creditsUsedThisCycle: 18_000,
      subscriptionStatus: "ACTIVE",
    },
  });

  console.log(`Seed concluído: planos "${starter.name}", "${pro.name}" e "${agencia.name}" criados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
