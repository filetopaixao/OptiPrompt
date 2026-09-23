import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function TermosPage() {
  return (
    <LegalPageLayout title="Termos de uso">
      <h2>O que é o OtimizaIA</h2>
      <p>
        Uma plataforma pra agências testarem e compararem modelos de IA (custo, latência e
        qualidade) via OpenRouter, sem precisar cadastrar chaves de API de cada provedor
        separadamente.
      </p>
      <h2>Planos e créditos</h2>
      <p>
        Cada plano tem um teto mensal de créditos, derivado do valor da assinatura. Cada execução
        debita créditos proporcionais ao custo real cobrado pelo provedor (convertido a uma taxa
        fixa). Ao atingir o teto, novas execuções ficam bloqueadas até o próximo ciclo ou até uma
        recarga avulsa, quando disponível. Créditos do ciclo não acumulam para o mês seguinte;
        créditos avulsos comprados não vencem.
      </p>
      <h2>Plano Free</h2>
      <p>
        O plano Free permite uma execução real por dia, com até 3 modelos de uma lista reduzida
        definida pela plataforma, sujeita a limites de tamanho de prompt/arquivo e de tokens de
        saída. Não é um plano ilimitado; existe pra você experimentar o produto antes de assinar.
        Reservamo-nos o direito de aplicar limites adicionais contra uso abusivo (múltiplas contas,
        automação de cadastro etc.).
      </p>
      <h2>Disponibilidade</h2>
      <p>
        A disponibilidade dos modelos depende do OpenRouter e de cada provedor — instabilidade ou
        mudança de preço nesses serviços pode afetar o funcionamento ou custo do teste. Uma falha
        exclusiva de provedor não invalida seu uso do plano.
      </p>
      <h2>Cancelamento</h2>
      <p>
        Assinaturas pagas podem ser canceladas a qualquer momento; o acesso e os créditos do plano
        continuam válidos até o fim do ciclo já pago.
      </p>
      <h2>Uso responsável</h2>
      <p>
        Você é responsável pelo conteúdo que envia para teste, incluindo garantir que tem permissão
        pra usar quaisquer dados de clientes nos prompts/arquivos testados.
      </p>
      <h2>Contato</h2>
      <p>Dúvidas: (71) 99901-8102.</p>
    </LegalPageLayout>
  );
}
