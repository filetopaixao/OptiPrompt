import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function RetencaoPage() {
  return (
    <LegalPageLayout title="Retenção e exclusão de dados">
      <h2>O que guardamos e por quê</h2>
      <ul>
        <li>Histórico de execuções (prompt, resposta, custo, latência) — pra você reconsultar e comparar depois.</li>
        <li>Benchmarks salvos (casos, modelos, critérios, execuções) — pra reexecução e comparação com baseline.</li>
        <li>Dados de conta e uso de crédito — pra cobrança e suporte.</li>
      </ul>
      <h2>Por quanto tempo</h2>
      <p>
        Enquanto a conta existir. Hoje não há uma política automática de expurgo por prazo fixo —
        planejamos tornar isso configurável por workspace no futuro.
      </p>
      <h2>Como pedir exclusão</h2>
      <p>
        Você pode apagar um benchmark (e seus resultados) diretamente pela tela de Benchmarks, a
        qualquer momento. Pra excluir a conta inteira ou dados específicos do histórico, entre em
        contato pelo WhatsApp (71) 99901-8102 — atendemos o pedido manualmente até existir um fluxo
        de autoatendimento completo.
      </p>
      <h2>Subprocessadores</h2>
      <p>
        Os dados enviados durante uma execução de teste passam pelo OpenRouter e pelo provedor do
        modelo escolhido (OpenAI, Anthropic, Google, DeepSeek, Mistral ou Meta, conforme o modelo).
        Não compartilhamos seus dados com nenhum outro terceiro além desses, necessários pra rodar
        o teste que você pediu.
      </p>
    </LegalPageLayout>
  );
}
