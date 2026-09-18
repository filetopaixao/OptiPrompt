import type { Metadata } from "next";
import { listPlans } from "@/lib/plans";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OptiPrompt para Agências",
  description:
    "Descubra qual modelo de IA é mais barato antes de escalar sua operação. Compare custo, velocidade e qualidade entre GPT, Claude, Gemini e mais.",
};

export default async function AgenciasPage() {
  const plans = await listPlans();

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
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
