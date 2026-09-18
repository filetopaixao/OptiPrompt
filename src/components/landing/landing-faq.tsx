import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Preciso ter minhas próprias chaves de API dos modelos?",
    answer:
      "Não. O OptiPrompt já roda com chaves da plataforma — você só escolhe os modelos e usa os créditos do seu plano.",
  },
  {
    question: "Como o custo por requisição é calculado?",
    answer:
      "Lemos os tokens de entrada e saída retornados por cada provedor e aplicamos a tabela de preços oficial de cada modelo, convertendo para créditos internos em tempo real.",
  },
  {
    question: "Consigo colocar minha marca no relatório para o meu cliente?",
    answer:
      "Sim — no plano Enterprise você adiciona seu logo e exporta um relatório PDF whitelabel, sem nenhuma marca do OptiPrompt visível para o cliente final.",
  },
  {
    question: "O que acontece se eu ultrapassar os créditos do plano?",
    answer:
      "A execução de novos testes é pausada para garantir que você nunca tenha cobranças surpresas no seu cartão. Caso precise de mais capacidade antes da sua renovação mensal, você pode adquirir pacotes de recarga avulsa com um clique (ex: +9.700 créditos por R$ 39,00). O saldo avulso é liberado instantaneamente e não altera o valor da sua assinatura recorrente.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, a assinatura é mensal e sem fidelidade — cancele quando quiser direto pelo portal de cobrança.",
  },
] as const;

export function LandingFAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-16 sm:px-6">
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
