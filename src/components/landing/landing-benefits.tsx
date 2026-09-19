import { Activity, GitCompare, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Receipt,
    title: "Custo Transparente por Chamada e Modelo",
    description:
      "Descubra o custo exato em frações de centavo e tokens gastos em cada execução, comparando lado a lado o consumo de cada modelo.",
  },
  {
    icon: Activity,
    title: "Latência e Tempo de Resposta",
    description:
      "Descubra instantaneamente qual modelo de IA responde mais rápido e garanta automações ágeis e sem atrasos para os seus clientes.",
  },
  {
    icon: GitCompare,
    title: "Teste A/B de Prompts em Produção",
    description:
      "Compare custo, tempo e desempenho entre a v1 e a v2 do seu prompt com dados reais antes de ir para produção.",
  },
] as const;

export function LandingBenefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
