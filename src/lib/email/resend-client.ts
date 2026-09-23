import { Resend } from "resend";

/** URL pública do app — usada pra montar o link de verificação de e-mail.
 * Mesmo padrão de variável já esperado em produção (ver metadata do site em
 * src/app/page.tsx, que usa o domínio fixo otimizaia.app). */
export const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://otimizaia.app";

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "OtimizaIA <naoresponda@otimizaia.app>";

let resendClient: Resend | null = null;

/** Lazy singleton — só instancia (e só exige RESEND_API_KEY) na primeira
 * chamada real de envio, nunca no import do módulo. Sem a chave configurada
 * (setup do Resend ainda pendente — ver resumo da Release 1), retorna null
 * e quem chamar decide como degradar (hoje: loga e segue sem quebrar o
 * cadastro, ver send-verification-email.ts). */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}
