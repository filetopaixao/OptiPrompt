import { Check, X } from "lucide-react";

/**
 * Tabela objetiva OtimizaIA x PromptFoo — pensada pra capturar buscas
 * literais de quem já usa/pesquisou o PromptFoo e está frustrado com CLI/
 * YAML ("promptfoo alternative", "promptfoo sem código", "promptfoo
 * interface gráfica"). Cada linha é um fato verificável sobre o PromptFoo
 * (ferramenta open-source de linha de comando, sem billing nem relatório
 * white-label prontos) — não é opinião nem depoimento fabricado.
 */
const COMPARISON_ROWS: { question: string; promptfoo: string; otimizaia: string }[] = [
  {
    question: "Precisa saber programar?",
    promptfoo: "Sim — configura tudo em YAML e roda por linha de comando",
    otimizaia: "Não — interface visual, clique e pronto",
  },
  {
    question: "Interface gráfica, sem terminal?",
    promptfoo: "Não — é uma ferramenta de CLI",
    otimizaia: "Sim — nada de instalar nada no seu computador",
  },
  {
    question: "Precisa de chaves de API próprias dos provedores?",
    promptfoo: "Sim — você cadastra e paga cada provedor separado",
    otimizaia: "Não — já vem com créditos inclusos na assinatura",
  },
  {
    question: "Preço em reais, sem surpresa na fatura?",
    promptfoo: "Não — é grátis, mas você paga os provedores direto em dólar",
    otimizaia: "Sim — um valor fixo mensal em R$, créditos previsíveis",
  },
  {
    question: "Relatório pronto pra apresentar ao cliente final?",
    promptfoo: "Não — os resultados ficam no terminal/JSON",
    otimizaia: "Sim — PDF exportável, com sua marca no plano Enterprise",
  },
];

export function LandingComparison() {
  return (
    <section id="promptfoo" className="mx-auto max-w-4xl scroll-mt-16 px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">OtimizaIA vs PromptFoo</h2>
        <p className="mt-2 text-muted-foreground">
          A alternativa ao PromptFoo com interface gráfica, sem YAML e sem precisar programar —
          veja a diferença lado a lado.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="p-4 font-semibold">&nbsp;</th>
              <th className="p-4 font-semibold">PromptFoo</th>
              <th className="p-4 font-semibold text-primary">OtimizaIA</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, index) => (
              <tr key={row.question} className={index % 2 === 1 ? "bg-muted/20" : undefined}>
                <td className="border-t p-4 font-medium">{row.question}</td>
                <td className="border-t p-4 text-muted-foreground">
                  <span className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-rose-500" />
                    {row.promptfoo}
                  </span>
                </td>
                <td className="border-t p-4">
                  <span className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {row.otimizaia}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        O PromptFoo é uma ferramenta open-source excelente pra quem já programa e quer rodar testes
        via CLI. O OtimizaIA existe pra quem quer o mesmo tipo de comparação sem escrever código.
      </p>
    </section>
  );
}
