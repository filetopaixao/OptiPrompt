/**
 * Teto de tokens de saída aplicado a toda chamada de modelo, em todo
 * provedor. Existe por dois motivos: (1) limita o custo máximo possível de
 * uma única resposta, e (2) torna esse máximo calculável ANTES de chamar o
 * provedor — ver estimateWorstCaseCostInBRL em pricing.ts, que usa esse
 * valor pra bloquear execuções que estourariam o saldo do usuário antes de
 * gastar dinheiro de verdade nas APIs.
 */
export const MAX_OUTPUT_TOKENS = 1024;
