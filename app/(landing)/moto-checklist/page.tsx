import type { Metadata } from "next";
import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FounderQuote } from "@/components/landing/founder-quote";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RaceChecklist } from "@/components/landing/race-checklist";
import { ScrollLink } from "@/components/landing/scroll-link";

const TITLE = "Checklist pre-carrera para tu moto | Mi Vehículo";
const DESCRIPTION =
  "Checklist pre-carrera: cubiertas, transmisión, suspensión, frenos, fluidos y herramientas. Tachá lo que ya le hiciste a tu moto y creá tu vehículo para que el plan cuente los intervalos solo.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/moto-checklist",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Same as landing-page.tsx: only the hero needs this constraint — every
// other section below is a top-level sibling carrying its own width.
const CONTAINER_CLASSES =
  "mx-auto flex w-full max-w-5xl flex-col px-4 py-12 sm:px-6 md:py-16";

// Generic evergreen sibling of /carreras/[slug]: same checklist, no event
// branding — for "tengo carrera pronto" traffic that isn't tied to a race.
// Signed-in users are redirected to /dashboard by proxy.ts, same as the
// other (landing) routes, so the page prerenders as static.
export default function MotoChecklistPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section id="inicio" className={CONTAINER_CLASSES}>
        {/* No event image to anchor a two-column grid — single centered
            column instead, matching the wizard/checklist sections. */}
        <div className="mx-auto flex min-h-screen w-full max-w-md snap-start flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl leading-tight font-black tracking-tight uppercase sm:text-4xl lg:text-5xl">
            Dejá tu moto{" "}
            <span className="text-primary">lista para la carrera</span>
          </h1>
          <p className="text-lg text-muted">
            El checklist pre-carrera que usan los riders antes del día de
            largada — tachá lo que ya le hiciste.
          </p>
          <ScrollLink
            hash="#checklist"
            className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-center text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
          >
            Ver el checklist
          </ScrollLink>
        </div>
      </section>

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
        <RaceChecklist storageKey="mv:moto-checklist" source="moto-checklist" />
      </section>

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
