import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Depoimentos fictícios (placeholder) — pedido explícito para a landing page
 * de lançamento. Trocar por depoimentos reais de clientes antes de publicar
 * a página em produção.
 */
const TESTIMONIALS = [
  {
    quote:
      "Trocamos o modelo padrão de um cliente depois de ver a projeção de custo no OptiPrompt — economizamos 40% na conta de API sem perder qualidade na resposta.",
    author: "Marina Costa",
    role: "Head de IA, Nexus Digital",
  },
  {
    quote:
      "O relatório exportável virou parte da nossa proposta comercial. Mostrar o comparativo de custo real fechou negócio com dois clientes novos.",
    author: "Rafael Andrade",
    role: "Sócio, Loop Growth Agência",
  },
  {
    quote:
      "Testávamos prompt em cada API manualmente. Agora rodamos tudo em paralelo e decidimos em minutos, não em dias.",
    author: "Bianca Ferreira",
    role: "Tech Lead, Estúdio Orbit",
  },
] as const;

export function LandingTestimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Agências que já economizam com OptiPrompt</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.author}>
            <CardContent className="flex flex-col gap-4 pt-2">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-medium">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
