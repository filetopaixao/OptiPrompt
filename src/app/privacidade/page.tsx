import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function PrivacidadePage() {
  return (
    <LegalPageLayout title="Política de privacidade">
      <h2>Quem processa seus dados</h2>
      <p>
        O OtimizaIA (operado pela equipe do OtimizaIA) atua como controlador dos dados da sua conta
        (nome, e-mail, uso e créditos) e como operador dos prompts, arquivos e respostas que você
        envia para teste — esses dados existem pra você comparar modelos, não são usados pra outro
        fim.
      </p>
      <h2>O que enviamos ao OpenRouter e aos provedores de modelo</h2>
      <p>
        Cada execução de teste envia o prompt (instruções do sistema, mensagem do usuário e
        eventual arquivo/imagem anexado) ao{" "}
        <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
          OpenRouter
        </a>
        , que repassa ao provedor do modelo escolhido (OpenAI, Anthropic, Google, DeepSeek,
        Mistral, Meta, conforme o modelo selecionado). Isso acontece só durante a execução — não
        enviamos dados de uma conta para os testes de outra.
      </p>
      <h2>Dados sensíveis e anonimização</h2>
      <p>
        Se os prompts/arquivos que você testa contêm dados pessoais ou sensíveis de clientes seus,
        a decisão de anonimizar antes de testar é sua — recomendamos anonimizar sempre que o teste
        não depender do dado real. Casos de benchmark têm um campo pra marcar manualmente que
        aquele caso foi anonimizado.
      </p>
      <h2>Retenção</h2>
      <p>
        Histórico de execuções e benchmarks fica salvo na sua conta enquanto ela existir, pra você
        poder reexecutar e comparar depois. Veja detalhes em{" "}
        <a href="/retencao">Retenção e exclusão de dados</a>.
      </p>
      <h2>Isolamento entre contas</h2>
      <p>
        Cada workspace (conta/projeto) só enxerga os próprios dados — histórico, benchmarks e
        prompts de uma conta nunca aparecem em outra. Colaboradores de um mesmo projeto Enterprise
        compartilham histórico entre si, mas não com outros projetos.
      </p>
      <h2>LLM-as-judge</h2>
      <p>
        Quando você define uma regra de verificação, um modelo de IA avalia a resposta contra essa
        regra — isso também gera uma chamada de API (com custo em crédito) e, como qualquer modelo,
        pode errar o veredito ocasionalmente.
      </p>
      <h2>Contato</h2>
      <p>
        Dúvidas sobre privacidade: fale conosco pelo WhatsApp (71) 99901-8102.
      </p>
    </LegalPageLayout>
  );
}
