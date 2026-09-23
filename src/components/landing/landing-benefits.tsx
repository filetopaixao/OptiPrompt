import {
  FileText,
  FlaskConical,
  FolderKanban,
  GitCompare,
  Key,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Key,
    title: "Sem administrar chaves de vários provedores",
    description:
      "OpenAI, Anthropic, Google, DeepSeek e mais numa única conta, via OpenRouter — nenhum cadastro individual de API key.",
  },
  {
    icon: Receipt,
    title: "Custo por execução e por volume",
    description:
      "Custo exato de cada chamada e projeção de custo mensal simulando o volume real de requisições do seu cliente.",
  },
  {
    icon: FileText,
    title: "Testes com dados reais do workflow",
    description:
      "Texto, imagem, PDF e documentos — teste com os mesmos tipos de entrada que sua automação recebe de verdade.",
  },
  {
    icon: FlaskConical,
    title: "Benchmarks persistentes",
    description:
      "Salve casos de teste, modelos e critérios uma vez e reexecute sempre que mudar um prompt — não é uma comparação única.",
  },
  {
    icon: GitCompare,
    title: "Comparação com baseline",
    description:
      "Reexecute um benchmark salvo e compare com a versão anterior para pegar regressão de custo, qualidade ou latência antes de publicar.",
  },
  {
    icon: FolderKanban,
    title: "Projetos isolados por cliente",
    description:
      "Organize benchmarks e histórico por cliente — dados de um projeto nunca aparecem em outro.",
  },
] as const;

export function LandingBenefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Diferenciais</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardContent className="flex flex-col items-start gap-3 pt-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
