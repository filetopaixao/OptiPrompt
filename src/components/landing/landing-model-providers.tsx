import { Card, CardContent } from "@/components/ui/card";
import { MODEL_CATALOG, type Provider } from "@/types/models";

// Mesma ordem/rótulos usados no seletor de modelos e na FAQ (ver
// components/dashboard/model-selector.tsx e landing-faq.tsx) — mantém a
// vitrine consistente com o que o usuário realmente vê dentro do app.
const PROVIDER_ORDER: Provider[] = ["OPENAI", "ANTHROPIC", "GOOGLE", "META", "DEEPSEEK", "MISTRAL"];

const PROVIDER_LABELS: Partial<Record<Provider, string>> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  META: "Meta",
  DEEPSEEK: "DeepSeek",
  MISTRAL: "Mistral",
};

const PROVIDER_LOGOS: Partial<Record<Provider, string>> = {
  OPENAI: "/logos/openai.svg",
  ANTHROPIC: "/logos/anthropic.svg",
  GOOGLE: "/logos/google.svg",
  META: "/logos/meta.svg",
  DEEPSEEK: "/logos/deepseek.svg",
  MISTRAL: "/logos/mistral.svg",
};

/** Monta a vitrine direto do catálogo (types/models.ts) — nunca fica
 * desatualizada quando um modelo é trocado ou adicionado, igual à resposta
 * "quais modelos" da FAQ. */
function buildProviderShowcase() {
  return PROVIDER_ORDER.map((provider) => {
    const models = MODEL_CATALOG.filter((model) => model.provider === provider)
      .slice(0, 2)
      .map((model) => model.label);

    return {
      provider,
      label: PROVIDER_LABELS[provider]!,
      logo: PROVIDER_LOGOS[provider]!,
      models: models.join(" · "),
    };
  }).filter((entry) => entry.models.length > 0);
}

export function LandingModelProviders() {
  const providers = buildProviderShowcase();

  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Compatível com os principais provedores e LLMs do mercado
          </h2>
          <p className="mt-2 text-muted-foreground">
            Testes em paralelo entre OpenAI, Anthropic, Google, Meta e mais — tudo numa única
            comparação.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {providers.map(({ provider, label, logo, models }) => (
            <Card key={provider} className="border-dashed bg-card/60 shadow-none">
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ícones estáticos pequenos, sem necessidade do pipeline de otimização (e SVG não passa por ele por padrão). */}
                  <img src={logo} alt={label} className="size-7 object-contain" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold tracking-tight">{label}</span>
                  <span className="text-xs text-muted-foreground">{models}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
