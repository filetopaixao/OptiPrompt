# Changelog

Este arquivo documenta as mudanças de produto relevantes do OtimizaIA, por release.

## Release 1 — Ativação, plano Free e benchmark persistente (2026-09-23)

### Landing page
- Hero reescrito: remove a promessa "reduza 60%" sem metodologia; nova mensagem central
  ("teste modelos reais... escolha o menor custo que mantém a qualidade"), 3 CTAs
  ("Testar gratuitamente", "Ver como funciona", "Calcular economia").
- Nova seção "Como funciona" (4 passos).
- Novo widget de demonstração interativo, 100% estático (sem chamada ao OpenRouter no
  carregamento da página, sem custo por visitante) — números claramente rotulados como
  exemplo ilustrativo.
- Nova calculadora de economia (3 sliders, fórmula local e transparente, eventos de funil,
  testes unitários da fórmula).
- Diferenciais reescritos (sem chaves de API por provedor, testes com dados reais, benchmarks
  persistentes, comparação com baseline, projetos isolados por cliente).
- Nova seção "Para quem é" (agências de automação, agências de agentes, consultorias,
  software houses).
- Nova seção explicando o conceito de benchmark persistente, com exemplo.
- Nova seção de confiança com links para as páginas legais e explicação do uso do OpenRouter.
- Bloco de transparência de créditos na seção de planos (o que é, como é consumido, o que
  acontece ao zerar, se acumula, recarga avulsa).
- Novas páginas `/privacidade`, `/termos`, `/retencao` (rascunho, sinalizado como em revisão
  jurídica).

### Plano Free
- Novo plano `free`: autoatendimento, perpétuo, atribuído automaticamente no cadastro público
  (`/cadastro`), sem cartão. Distinto do plano interno "Gratuito" (trial de 7 dias, só o admin
  atribui), que continua existindo sem alteração.
- 1 execução real por dia (reset às 03:00 UTC / meia-noite BRT), até 3 modelos por execução,
  escolhidos só entre os modelos marcados como ativos em `/admin/modelos` (lista configurável,
  nunca hardcoded no frontend).
- Falha exclusiva de provedor não consome a execução do dia; toda tentativa (sucesso ou falha)
  fica registrada para telemetria de abuso.
- Rate limit por IP na execução do plano Free (em memória — ver riscos conhecidos).
- Verificação de e-mail obrigatória pra rodar a execução diária (não bloqueia login nem o
  resto do app) — envio via Resend.

### Modelos
- `ModelSelector` agora mostra 3 estados por modelo: disponível, bloqueado pelo plano (com
  CTA de upgrade) e temporariamente indisponível — antes, modelos fora do plano simplesmente
  desapareciam da lista. Vale pra todos os planos, não só o Free.

### Projetos e benchmarks persistentes
- Criação de `Project` liberada para qualquer plano ativo (antes, exclusiva do Enterprise);
  o recurso de colaboradores (múltiplos logins por projeto) continua exclusivo do Enterprise.
- Novas entidades: `Benchmark`, `BenchmarkCase`, `BenchmarkModel`, `BenchmarkRun`,
  `BenchmarkResult`.
- Nova área `/app/benchmarks`: criar benchmark (com o primeiro caso já incluído), adicionar
  mais casos, escolher modelos, definir critérios de aprovação (qualidade mínima, queda
  máxima de qualidade, aumento máximo de custo/latência), executar (reaproveita o mesmo motor
  de execução do dashboard), salvar uma run como baseline, comparar duas runs (veredito
  aprovado/atenção/reprovado) e exportar relatório de avaliação em `/report/benchmark/[runId]`.

### Outros
- Log mínimo de eventos de produto (`ProductEvent` + `/api/events`) para os eventos de funil
  do Free e da calculadora.
- `src/lib/db/prisma.ts` marcado `server-only` — evita que um client component importe o
  driver do Postgres pro bundle do navegador por engano (bug real encontrado e corrigido
  durante esta release).
- `Benchmark.createdByUserId` e `BenchmarkRun.createdByUserId` viraram opcionais com
  `onDelete: SetNull` — evita que remover a conta de quem criou (ex.: um colaborador) quebre
  com erro de chave estrangeira.

### Riscos e limitações conhecidas
- Rate limit por IP do plano Free é em memória — não sobrevive a restart nem funciona com
  múltiplas instâncias do servidor.
- Envio de e-mail de verificação depende de `RESEND_API_KEY`; sem ela, o link é só logado no
  servidor (não bloqueia o cadastro, mas o e-mail real não sai).
- Benchmark ainda não reaproveita upload de imagem/documento do dashboard (`PromptEditorPanel`)
  na tela de "Adicionar caso" — hoje só texto. Persistência de imagem no `BenchmarkCase` já
  existe no schema para quando isso for implementado.
