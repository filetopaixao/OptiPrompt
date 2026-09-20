import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DemoVideoDialog } from "./demo-video-dialog";
import { HeroSlider } from "./hero-slider";

export function LandingHero() {
  return (
    // Seção com tema dark próprio — reaproveita os tokens .dark do design
    // system (globals.css), então bg-background/text-foreground/etc. já
    // resolvem pra paleta escura só dentro desta seção.
    <section className="dark border-b border-white/10 bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="rounded-full border border-white/10 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Observabilidade &amp; Métricas de IA para Agências
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Reduza em média <span className="font-extrabold text-primary">60%</span> os custos
            das suas LLMs.
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            O ambiente definitivo de AI FinOps. Execute testes A/B de prompts para comparar
            qualidade, custos e latência lado a lado. Acesse OpenAI, Anthropic e Google em uma
            única plataforma —{" "}
            <span className="font-semibold text-foreground">
              sem precisar de contas pagas ou chaves de API separadas para cada provedor
            </span>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#planos" className={buttonVariants({ size: "lg" })}>
              Quero Economizar 60% Agora
              <ArrowRight />
            </a>
            <DemoVideoDialog />
          </div>
        </div>

        <HeroSlider />
      </div>
    </section>
  );
}
