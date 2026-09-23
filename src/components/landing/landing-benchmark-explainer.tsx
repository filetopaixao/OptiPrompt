import { CheckCircle2 } from "lucide-react";

export function LandingBenchmarkExplainer() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">O que é um benchmark persistente</h2>
          <p className="mt-4 text-muted-foreground">
            Um benchmark persistente é um conjunto salvo de prompts, documentos, imagens, critérios
            e modelos que pode ser executado novamente sempre que você mudar um prompt, modelo ou
            workflow. Assim, você compara a nova versão com a anterior e identifica regressões
            antes de publicar.
          </p>
        </div>
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <p className="text-sm font-semibold">Benchmark: &ldquo;Atendimento — Cliente X&rdquo;</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              25 casos reais anonimizados
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Modelo atual: Gemini Flash
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Modelo candidato: Claude Haiku
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Qualidade mínima: 8/10
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Custo máximo: R$0,05 por execução
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-50/50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            Resultado: aprovado, reprovado ou requer revisão
          </div>
        </div>
      </div>
    </section>
  );
}
