import { ArrowRight, Calculator, PlayCircle } from "lucide-react";
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
            Testes e AI FinOps para Agências
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Teste modelos reais nos seus prompts e escolha o{" "}
            <span className="font-extrabold text-primary">menor custo</span> que mantém a
            qualidade da sua automação.
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Descubra qual modelo entrega a melhor combinação de qualidade, custo e velocidade
            para cada automação dos seus clientes — testes reais via OpenRouter, comparando
            custo, latência e qualidade lado a lado, com suporte a texto, imagem, PDF e
            documentos.{" "}
            <span className="font-semibold text-foreground">
              Nenhum cadastro individual de chave de provedor.
            </span>{" "}
            Pensado para agências que gerenciam automações de vários clientes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="/cadastro" className={buttonVariants({ size: "lg" })}>
              Testar gratuitamente
              <ArrowRight />
            </a>
            <a href="#como-funciona" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <PlayCircle />
              Ver como funciona
            </a>
            <a href="#calculadora" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              <Calculator />
              Calcular economia
            </a>
          </div>
          <DemoVideoDialog />
        </div>

        <HeroSlider />
      </div>
    </section>
  );
}
