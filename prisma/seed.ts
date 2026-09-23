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

  // Plano interno "Gratuito" — só o admin atribui (ver admin/usuarios),
  // nunca aparece na página pública de preços (ver HIDDEN_PLAN_SLUGS em
  // src/lib/plans.ts). Preço 0 exige fixedMonthlyCreditLimit, já que o
  // teto normal (20% do preço) daria zero créditos.
  await prisma.plan.upsert({
    where: { slug: "gratuito" },
    update: { name: "Gratuito", priceInCents: 0, fixedMonthlyCreditLimit: 300 },
    create: { name: "Gratuito", slug: "gratuito", priceInCents: 0, fixedMonthlyCreditLimit: 300 },
  });

  // Plano "Free" — autoatendimento, perpétuo, atribuído automaticamente no
  // cadastro (ver src/lib/plans/free-tier.ts). Diferente do "Gratuito"
  // acima: não expira, mas trava em 1 execução/dia via
  // User.freeExecutionUsedAt, não pelo teto de créditos. O teto de créditos
  // aqui é só uma trava de segurança de fundo (bem acima do gasto real
  // possível em 1 execução/dia com até 3 modelos baratos).
  await prisma.plan.upsert({
    where: { slug: "free" },
    update: { name: "Free", priceInCents: 0, fixedMonthlyCreditLimit: 3000 },
    create: { name: "Free", slug: "free", priceInCents: 0, fixedMonthlyCreditLimit: 3000 },
  });

  // Lista padrão do plano Free — 1 modelo custo-benefício por provedor
  // diferente (ver src/lib/plans/free-tier.ts), configurável depois em
  // /admin/modelos sem precisar de deploy.
  const DEFAULT_FREE_TIER_MODEL_IDS = [
    "openai/gpt-4o-mini",
    "anthropic/claude-haiku-4.5",
    "google/gemini-3.5-flash-lite",
    "deepseek/deepseek-v3.2",
    "mistralai/mistral-small-3.2-24b-instruct",
  ];
  for (const [index, modelId] of DEFAULT_FREE_TIER_MODEL_IDS.entries()) {
    await prisma.freeTierModel.upsert({
      where: { modelId },
      update: {},
      create: { modelId, active: true, sortOrder: index },
    });
  }

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
