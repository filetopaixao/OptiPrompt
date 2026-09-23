import { Bot, Building2, Users, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AUDIENCES = [
  {
    icon: Bot,
    title: "Agências de automação de IA",
    pain: "Difícil saber se o workflow do cliente está rentável sem medir custo real por execução.",
  },
  {
    icon: Wrench,
    title: "Agências que desenvolvem agentes",
    pain: "Trocar de modelo sem evidência — decisão no chute, sem comparação de custo e qualidade lado a lado.",
  },
  {
    icon: Building2,
    title: "Consultorias de IA",
    pain: "Retrabalho toda vez que precisa reavaliar modelos, sem um histórico reutilizável do que já foi testado.",
  },
  {
    icon: Users,
    title: "Software houses e times com vários clientes",
    pain: "Impossível explicar ao cliente por que um modelo foi escolhido, sem um relatório com dado real por trás.",
  },
] as const;

export function LandingAudience() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Para quem é</h2>
        <p className="mt-2 text-muted-foreground">
          Pensado pra quem decide qual modelo usar em produção — e precisa justificar essa decisão.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {AUDIENCES.map(({ icon: Icon, title, pain }) => (
          <Card key={title}>
            <CardContent className="flex items-start gap-4 pt-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pain}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
