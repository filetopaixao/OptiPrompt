import { prisma } from "@/lib/db/prisma";
import { creditsToUSD } from "@/lib/credits/credit-converter";
import { getUsageSummary } from "@/lib/credits/usage-service";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/** Teto mínimo de gasto em USD — o OpenRouter não aceita limit 0/negativo,
 * e uma conta recém-criada sem plano ainda precisa de uma chave utilizável. */
const MIN_LIMIT_USD = 0.01;

function getProvisioningKey(): string {
  const key = process.env.OPENROUTER_PROVISIONING_KEY;
  if (!key) throw new Error("OPENROUTER_PROVISIONING_KEY não configurada.");
  return key;
}

async function createOpenRouterKey(name: string, limitUsd: number): Promise<{ hash: string; key: string }> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getProvisioningKey()}`,
      "Content-Type": "application/json",
    },
    // limit_reset "monthly" faz o OpenRouter zerar o uso contabilizado
    // contra o teto todo mês sozinho, sem precisarmos disparar isso no
    // reset de ciclo interno (ver resetUserCycle em admin/usuarios).
    body: JSON.stringify({ name, limit: limitUsd, limit_reset: "monthly" }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao criar chave no OpenRouter (${response.status}): ${await response.text()}`);
  }

  const json = await response.json();
  return { hash: json.data.hash as string, key: json.key as string };
}

async function updateOpenRouterKeyLimit(hash: string, limitUsd: number): Promise<void> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/keys/${hash}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getProvisioningKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit: limitUsd }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao atualizar limite no OpenRouter (${response.status}): ${await response.text()}`);
  }
}

function limitFromCredits(credits: number): number {
  return Math.max(MIN_LIMIT_USD, creditsToUSD(credits));
}

/**
 * Garante que o usuário tem uma chave própria no OpenRouter, provisionando
 * na primeira execução se ainda não existir — o teto inicial reflete o
 * saldo de créditos do plano atual dele. Chamada no caminho síncrono de
 * /api/executions, então erros aqui devem propagar (sem chave não dá pra
 * chamar nenhum modelo).
 */
export async function ensureOpenRouterApiKey(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { openRouterApiKey: true },
  });

  if (user.openRouterApiKey) return user.openRouterApiKey;

  const usage = await getUsageSummary(userId);
  const { hash, key } = await createOpenRouterKey(`optiprompt-${userId}`, limitFromCredits(usage.creditsTotal));

  await prisma.user.update({
    where: { id: userId },
    data: { openRouterApiKey: key, openRouterKeyHash: hash },
  });

  return key;
}

/**
 * Sincroniza o teto de gasto do usuário no OpenRouter com o saldo de
 * créditos interno — chamar sempre que creditsTotal mudar (checkout de
 * assinatura, troca de plano, compra de crédito avulso, concessão manual
 * pelo admin). É uma trava de segurança por baixo do sistema de créditos
 * interno, não a fonte da verdade — por isso nunca propaga erro: uma falha
 * de rede aqui não pode quebrar o webhook do Stripe nem uma ação do admin.
 * Se o usuário ainda não tem chave, não cria uma agora — ela nasce sob
 * demanda na primeira execução, já com o teto certo (ver ensureOpenRouterApiKey).
 */
export async function syncOpenRouterLimit(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { openRouterKeyHash: true },
    });
    if (!user.openRouterKeyHash) return;

    const usage = await getUsageSummary(userId);
    await updateOpenRouterKeyLimit(user.openRouterKeyHash, limitFromCredits(usage.creditsTotal));
  } catch (error) {
    console.error("Falha ao sincronizar teto de gasto no OpenRouter:", error);
  }
}

/** Saldo real da conta mestre da OtimizaIA no OpenRouter — usado no
 * /admin/creditos pra lembrar de recarregar antes que os clientes sintam. */
export async function getMasterAccountBalance(): Promise<{
  totalCreditsUSD: number;
  totalUsageUSD: number;
}> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/credits`, {
    headers: { Authorization: `Bearer ${getProvisioningKey()}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar saldo do OpenRouter (${response.status}): ${await response.text()}`);
  }

  const json = await response.json();
  return {
    totalCreditsUSD: json.data.total_credits as number,
    totalUsageUSD: json.data.total_usage as number,
  };
}
