import type { Metadata } from "next";
import { listPlans } from "@/lib/plans";
import { LandingAudience } from "@/components/landing/landing-audience";
import { LandingBenchmarkExplainer } from "@/components/landing/landing-benchmark-explainer";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingComparison } from "@/components/landing/landing-comparison";
import { LandingDemoWidget } from "@/components/landing/landing-demo-widget";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingModelProviders } from "@/components/landing/landing-model-providers";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingSavingsCalculator } from "@/components/landing/landing-savings-calculator";
import { LandingTrust } from "@/components/landing/landing-trust";
import { SubscriptionRequiredBanner } from "@/components/landing/subscription-required-banner";

export const dynamic = "force-dynamic";

const TITLE = "OtimizaIA — Testes de Prompts e AI FinOps para Agências";
const DESCRIPTION =
  "Compare custo, velocidade e qualidade entre modelos de IA (GPT, Claude, Gemini e mais) antes de escalar sua operação. A alternativa hospedada ao PromptFoo para agências rodarem testes de prompts sem código, com créditos inclusos e sem chaves de API separadas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://otimizaia.app" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://otimizaia.app",
    siteName: "OtimizaIA",
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
  name: "OtimizaIA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  url: "https://otimizaia.app",
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
      {assinatura === "necessaria" && <SubscriptionRequiredBanner reason="pagamento" />}
      {assinatura === "trial-expirada" && <SubscriptionRequiredBanner reason="trial" />}
      <main className="flex-1">
        <LandingHero />
        <LandingHowItWorks />
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <LandingDemoWidget />
        </section>
        <LandingBenefits />
        <LandingSavingsCalculator />
        <LandingAudience />
        <LandingBenchmarkExplainer />
        <LandingComparison />
        <LandingPricing plans={plans} />
        <LandingModelProviders />
        <LandingTrust />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
