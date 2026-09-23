/**
 * Teto de tokens de saída aplicado a toda chamada de modelo, em todo
 * provedor. Existe por dois motivos: (1) limita o custo máximo possível de
 * uma única resposta, e (2) torna esse máximo calculável ANTES de chamar o
 * provedor — ver estimateWorstCaseCostInBRL em pricing.ts, que usa esse
 * valor pra bloquear execuções que estourariam o saldo do usuário antes de
 * gastar dinheiro de verdade nas APIs.
 */
export const MAX_OUTPUT_TOKENS = 1024;

/** Faixa e padrão do parâmetro `temperature` enviado ao provedor — mesmos
 * limites usados no slider do dashboard (ver prompt-editor-panel.tsx) e na
 * validação de /api/executions, pra nunca deixar o front mandar um valor
 * fora do que a API dos modelos aceita. 0.7 é o padrão de fábrica da
 * maioria dos provedores (equilíbrio entre determinismo e criatividade). */
export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 2;
export const TEMPERATURE_STEP = 0.1;
export const DEFAULT_TEMPERATURE = 0.7;
