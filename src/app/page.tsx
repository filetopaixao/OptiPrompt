import type { Metadata } from "next";
import { listPlans } from "@/lib/plans";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { SubscriptionRequiredBanner } from "@/components/landing/subscription-required-banner";

export const dynamic = "force-dynamic";

const TITLE = "OptiPrompt — Testes de Prompts e AI FinOps para Agências";
const DESCRIPTION =
  "Compare custo, velocidade e qualidade entre modelos de IA (GPT, Claude, Gemini e mais) antes de escalar sua operação. A alternativa hospedada ao PromptFoo para agências rodarem testes de prompts sem código, com créditos inclusos e sem chaves de API separadas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://optiprompt.com.br" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://optiprompt.com.br",
    siteName: "OptiPrompt",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OptiPrompt",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  url: "https://optiprompt.com.br",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BRL",
    lowPrice: "97",
    highPrice: "597",
    offerCount: "3",
  },
};

export default async function AgenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ assinatura?: string }>;
}) {
  const [plans, { assinatura }] = await Promise.all([listPlans(), searchParams]);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <LandingNav />
      {assinatura === "necessaria" && <SubscriptionRequiredBanner />}
      <main className="flex-1">
        <LandingHero />
        <LandingBenefits />
        <LandingPricing plans={plans} />
        <LandingTestimonials />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
