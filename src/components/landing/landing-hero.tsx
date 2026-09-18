import { ArrowRight, ImageIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
      <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Feito para agências que escalam com IA
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Descubra qual modelo é mais barato{" "}
        <span className="text-primary">antes de escalar sua operação</span>
      </h1>
      <p className="max-w-2xl text-balance text-lg text-muted-foreground">
        Compare GPT, Claude, Gemini, Sabiá, Groq e mais em paralelo, veja o custo real por requisição
        projetado em escala e entregue relatórios de auditoria whitelabel para o seu cliente — sem
        gastar um centavo além do necessário.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href="#planos" className={buttonVariants({ size: "lg" })}>
          Assinar agora
          <ArrowRight />
        </a>
        <a href="#como-funciona" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Ver como funciona
        </a>
      </div>

      <div
        id="como-funciona"
        className="mt-8 flex aspect-video w-full max-w-4xl scroll-mt-24 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/40 text-muted-foreground"
      >
        <ImageIcon className="size-10" />
        <p className="text-sm font-medium">Screenshot da plataforma entra aqui</p>
        <p className="text-xs">(dashboard comparando modelos em tempo real)</p>
      </div>
    </section>
  );
}
