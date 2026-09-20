import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MODEL_CATALOG, type Provider } from "@/types/models";

const PROVIDER_ORDER: Provider[] = ["OPENAI", "ANTHROPIC", "GOOGLE", "GROQ", "DEEPSEEK", "MISTRAL"];

const PROVIDER_LABELS: Partial<Record<Provider, string>> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  GROQ: "Groq (open-weight)",
  DEEPSEEK: "DeepSeek",
  MISTRAL: "Mistral",
};

/** Monta a resposta "quais modelos" direto do catálogo (types/models.ts) —
 * nunca fica desatualizada quando um modelo é trocado ou adicionado. */
function buildModelsAnswer(): string {
  const groups = PROVIDER_ORDER.map((provider) => {
    const labels = MODEL_CATALOG.filter((model) => model.provider === provider).map(
      (model) => model.label,
    );
    if (labels.length === 0) return null;
    return `${PROVIDER_LABELS[provider]} (${labels.join(", ")})`;
  }).filter((group): group is string => group !== null);

  return `Hoje comparamos ${groups.join("; ")}. O plano Starter tem acesso a um catálogo reduzido (uma opção de cada provedor, mais uma amostra Premium); os planos Agência (Pro) e Enterprise liberam a lista completa.`;
}

const FAQ_ITEMS = [
  {
    question: "Quais modelos de IA temos disponíveis para comparar?",
    answer: buildModelsAnswer(),
  },
  {
    question: "Preciso ter minhas próprias chaves de API dos modelos?",
    answer:
      "Não. O OtimizaIA já roda com chaves da plataforma — você só escolhe os modelos e usa os créditos do seu plano.",
  },
  {
    question: "Como o custo por requisição é calculado?",
    answer:
      "Lemos os tokens de entrada e saída retornados por cada provedor e aplicamos a tabela de preços oficial de cada modelo, convertendo para créditos internos em tempo real.",
  },
  {
    question: "O OtimizaIA é uma alternativa ao PromptFoo?",
    answer:
      "Sim, pra quem quer testar e comparar prompts sem configurar YAML nem rodar nada por linha de comando. O PromptFoo é uma ferramenta open-source focada em desenvolvedores; o OtimizaIA é hospedado, com interface visual pronta pra qualquer pessoa da agência rodar testes A/B de prompts, comparar custo/latência/qualidade entre modelos e exportar relatório pro cliente — sem precisar de chaves de API próprias nem ambiente de desenvolvimento.",
  },
  {
    question: "Consigo colocar minha marca no relatório para o meu cliente?",
    answer:
      "Sim — no plano Enterprise você adiciona seu logo e exporta um relatório PDF whitelabel, sem nenhuma marca do OtimizaIA visível para o cliente final.",
  },
  {
    question: "O que acontece se eu ultrapassar os créditos do plano?",
    answer:
      "A execução de novos testes é pausada para garantir que você nunca tenha cobranças surpresas no seu cartão. Caso precise de mais capacidade antes da sua renovação mensal, você pode adquirir pacotes de recarga avulsa com um clique (ex: +10.000 créditos por R$ 39,00). O saldo avulso é liberado instantaneamente e não altera o valor da sua assinatura recorrente.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, a assinatura é mensal e sem fidelidade — cancele quando quiser direto pelo portal de cobrança.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function LandingFAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
      <Accordion>
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
