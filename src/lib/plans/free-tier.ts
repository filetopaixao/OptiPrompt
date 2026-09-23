/** Plano "Free" — autoatendimento, atribuído automaticamente no cadastro
 * (ver /api/auth/signup), perpétuo (sem expiração, diferente do "Gratuito"
 * de 7 dias em trial.ts). A trava real não é o teto de créditos, é 1
 * execução bem-sucedida por dia (ver User.freeExecutionUsedAt) com até
 * FREE_MAX_MODELS_PER_EXECUTION modelos, escolhidos só entre os marcados
 * como ativos em FreeTierModel (configurável em /admin/modelos). */
export const FREE_PLAN_SLUG = "free";
export const FREE_MAX_MODELS_PER_EXECUTION = 3;

/** Horário fixo (UTC) do reset diário — meia-noite BRT (UTC-3) é 03:00 UTC.
 * "Reset em horário definido pelo backend": um dia = da última passagem
 * deste horário até a próxima, não uma janela deslizante de 24h a partir do
 * último uso. */
const FREE_RESET_HOUR_UTC = 3;

/** Início do "dia Free" corrente, em UTC — tudo que aconteceu depois deste
 * instante já conta como "hoje". */
function currentFreeDayStart(now: Date): Date {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), FREE_RESET_HOUR_UTC),
  );
  if (start.getTime() > now.getTime()) {
    start.setUTCDate(start.getUTCDate() - 1);
  }
  return start;
}

/** Início do próximo "dia Free" — usado pra mostrar "próximo reset em Xh"
 * depois que a cota diária já foi usada. */
export function nextFreeResetAt(now: Date = new Date()): Date {
  const currentStart = currentFreeDayStart(now);
  const next = new Date(currentStart);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

/** true quando a última execução bem-sucedida do Free já foi hoje (dentro
 * da janela do dia corrente) — nesse caso a cota diária está esgotada. */
export function hasUsedFreeExecutionToday(
  freeExecutionUsedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!freeExecutionUsedAt) return false;
  return freeExecutionUsedAt.getTime() >= currentFreeDayStart(now).getTime();
}
