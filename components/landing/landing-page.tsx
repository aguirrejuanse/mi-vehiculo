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

// Only the hero needs this: every other section below is full-bleed and
// applies its own max-w-5xl constraint internally (see pain-banner.tsx).
const CONTAINER_CLASSES =
  "mx-auto flex w-full max-w-5xl flex-col px-4 py-12 sm:px-6 md:py-16";

export async function LandingPage({ variant }: LandingPageProps) {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <section className={CONTAINER_CLASSES}>
        {variant ? (
          <Hero variants={[variant]} activeIndex={0} />
        ) : (
          <HeroRotator variants={HERO_VARIANTS} />
        )}
      </section>

      <Benefits />
      <PainBanner />

      {/* Explains the 3 steps (step 1 is "Creá tu vehículo") before the
          wizard below asks the user to actually do it — reversed order
          would have the user reach "how it works" after already doing
          step 1. */}
      <HowItWorks />

      {/* The hero CTA links to this id (create-vehicle-link.tsx). Narrower
          than the other sections (max-w-md, not max-w-5xl), so it carries its
          own padding instead of reusing CONTAINER_CLASSES. */}
      <section
        id="crear"
        tabIndex={-1}
        aria-labelledby="crear-title"
        className="mx-auto flex min-h-screen w-full max-w-md scroll-mt-6 snap-start flex-col justify-center gap-6 px-4 py-12 outline-none sm:px-6 md:py-16"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="crear-title"
            className="text-3xl font-black tracking-tight uppercase sm:text-4xl"
          >
            Creá tu <span className="text-primary">vehículo</span>
          </h2>
          <p className="text-lg text-muted">
            Elegí el tipo, ponele nombre e indicá cuánto lleva usado.
          </p>
        </div>
        <VehicleWizard />
      </section>

      {/* Every section below is a top-level sibling, each carrying its own
          width constraint internally (see benefits.tsx/pain-banner.tsx for
          the pattern) — no <section> is ever wrapped in a layout <div>. */}
      <FeaturesGrid />
      <UseCases currentSlug={variant?.slug} />
      <FounderQuote />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
