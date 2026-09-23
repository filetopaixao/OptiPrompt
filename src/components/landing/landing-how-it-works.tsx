import { FolderPlus, GitCompareArrows, LineChart, Play } from "lucide-react";

const STEPS = [
  {
    icon: FolderPlus,
    title: "Crie um projeto para seu cliente",
    description: "Organize benchmarks e histórico por cliente — cada projeto fica isolado dos demais.",
  },
  {
    icon: Play,
    title: "Salve um benchmark com prompts e casos reais",
    description:
      "Comece com um caso de teste só. Adiciona documentos, imagens e mais casos quando quiser.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare modelos via OpenRouter",
    description: "Execução real, sem cadastrar nenhuma chave de API — custo, latência e qualidade lado a lado.",
  },
  {
    icon: LineChart,
    title: "Acompanhe custo, qualidade e regressões",
    description:
      "Reexecute o mesmo benchmark quando mudar um prompt ou modelo e compare com a versão anterior.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
          <p className="mt-2 text-muted-foreground">
            Não é só uma comparação única — o OtimizaIA mantém um histórico reutilizável.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="relative rounded-xl border bg-background p-5">
              <span className="absolute -top-3 -left-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <Icon className="mb-3 size-6 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
