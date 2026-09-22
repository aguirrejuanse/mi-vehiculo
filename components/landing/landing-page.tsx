import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { VehicleWizard } from "@/app/nuevo/vehicle-wizard";
import { Benefits } from "@/components/landing/benefits";
import { Faq } from "@/components/landing/faq";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FounderQuote } from "@/components/landing/founder-quote";
import { Hero } from "@/components/landing/hero";
import { HeroRotator } from "@/components/landing/hero-rotator";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PainBanner } from "@/components/landing/pain-banner";
import { UseCases } from "@/components/landing/use-cases";
import { HERO_VARIANTS, type HeroVariant } from "@/lib/landing/hero-variants";

type LandingPageProps = {
  // A fixed variant renders a static hero (`/{slug}`); without it the hero
  // rotates through every variant (`/`).
  variant?: HeroVariant;
};

// Repeated on both constrained chunks below, around the full-bleed sections
// that need to span the viewport (see pain-banner.tsx, final-cta.tsx,
// footer.tsx).
const CONTAINER_CLASSES =
  "mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-12 sm:px-6 md:py-16";

export async function LandingPage({ variant }: LandingPageProps) {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <div className={CONTAINER_CLASSES}>
        {variant ? (
          <Hero variants={[variant]} activeIndex={0} />
        ) : (
          <HeroRotator variants={HERO_VARIANTS} />
        )}
        <Benefits />
      </div>

      <PainBanner />

      <div className={CONTAINER_CLASSES}>
        {/* The hero CTA links to this id (create-vehicle-link.tsx). */}
        <section
          id="crear"
          tabIndex={-1}
          aria-labelledby="crear-title"
          className="mx-auto flex min-h-screen w-full max-w-md scroll-mt-6 snap-start flex-col justify-center gap-6 outline-none"
        >
          <div className="flex flex-col gap-2">
            <h2
              id="crear-title"
              className="text-2xl font-black tracking-tight uppercase"
            >
              Creá tu <span className="text-primary">vehículo</span>
            </h2>
            <p className="text-muted">
              Elegí el tipo, ponele nombre e indicá cuánto lleva usado.
            </p>
          </div>
          <VehicleWizard />
        </section>

        <HowItWorks />
        <FeaturesGrid />
        <UseCases currentSlug={variant?.slug} />
        <FounderQuote />
        <Faq />
      </div>

      <FinalCta />
      <Footer />
    </div>
  );
}
