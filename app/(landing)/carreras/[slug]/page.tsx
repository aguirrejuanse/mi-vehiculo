import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FounderQuote } from "@/components/landing/founder-quote";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RaceChecklist } from "@/components/landing/race-checklist";
import { RaceHero } from "@/components/landing/race-hero";
import { RACES, findRace } from "@/lib/landing/races";

// Unknown slugs 404 via notFound() in the page (dynamicParams=false would
// do it, but it also makes the colocated opengraph-image route 404 before
// its handler runs). /moto-checklist is the generic evergreen sibling and
// lives at its own route.
export function generateStaticParams() {
  return RACES.map((race) => ({ slug: race.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/carreras/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const race = findRace(slug);
  if (!race) return {};

  const title = `Dejá tu moto lista para el ${race.name} | Mi Vehículo`;
  const url = `/carreras/${race.slug}`;

  // Every og/twitter field inherits the root layout's homepage values —
  // without these, a shared link renders generic title/description and
  // og:url pointing at /. The colocated opengraph-image.tsx is detected
  // automatically — do NOT hardcode its URL: under a dynamic segment the
  // generated path differs from the file's URL convention.
  return {
    title,
    description: race.description,
    openGraph: { title, description: race.description, url },
    twitter: { title, description: race.description },
  };
}

// Same as landing-page.tsx: only the hero needs this constraint — every
// other section below is a top-level sibling carrying its own width.
const CONTAINER_CLASSES =
  "mx-auto flex w-full max-w-5xl flex-col px-4 py-12 sm:px-6 md:py-16";

// Signed-in users are redirected to /dashboard by proxy.ts — keeping that
// check out of this page is what lets the route prerender as static.
export default async function RacePage({
  params,
}: PageProps<"/carreras/[slug]">) {
  const { slug } = await params;
  const race = findRace(slug);
  if (!race) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <section id="inicio" className={CONTAINER_CLASSES}>
        <RaceHero race={race} />
      </section>

      {/* The centerpiece. Narrower than the other sections (max-w-md, same
          treatment as the wizard section in landing-page.tsx): a checklist
          reads as a form-like column, not a wide grid. */}
      <section
        id="checklist"
        tabIndex={-1}
        aria-labelledby="checklist-title"
        className="mx-auto flex min-h-screen w-full max-w-md scroll-mt-20 snap-start flex-col justify-center gap-6 px-4 py-12 outline-none sm:px-6 md:py-16"
      >
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="checklist-title"
            className="text-3xl font-black tracking-tight uppercase sm:text-4xl"
          >
            Checklist <span className="text-primary">pre-carrera</span>
          </h2>
          <p className="text-lg text-muted">
            Tachá lo que ya le hiciste a tu moto.
          </p>
        </div>
        <RaceChecklist storageKey={race.storageKey} source={race.source} />
      </section>

      {/* Bridge from the one-off checklist to the product: deliberately NOT
          the "dark box" pattern — it sits right before HowItWorks (which
          uses bg-box-section + bg-box) and two adjacent dark boxes would
          read as one section. Flat centered column instead. */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 md:py-16">
        <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
          La carrera pasa,{" "}
          <span className="text-primary">el desgaste sigue</span>
        </h2>
        <p className="max-w-md text-lg text-muted">
          Este checklist es la preparación de una vez. Pero el aceite de caja
          o las cubiertas vencen por horas de uso: cuando creés tu moto, el
          plan lo cuenta solo.
        </p>
        <CreateVehicleLink hash="#checklist" />
      </section>

      <HowItWorks hash="#checklist" />

      <FounderQuote />
      <FinalCta hash="#checklist" />
      <Footer />
    </div>
  );
}
