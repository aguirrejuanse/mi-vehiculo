import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";

// Not full-bleed like the other alternating sections: this one is the
// Contiant "dark box" treatment (their .usps__parent — a large rounded,
// inset card) instead of an edge-to-edge tint. Uses the fixed bg-box/
// text-box-title/text-box-desc tokens — same pattern as final-cta.tsx,
// founder-quote.tsx and how-it-works.tsx — deliberately not bg-foreground/
// text-background, so this pattern doesn't shift if the app's theme colors
// change later. See globals.css's --color-box* tokens. The section itself
// uses bg-box-section (not bg-background): a fixed lavender-tinted off-white
// that needs to stay put regardless of system color scheme so it contrasts
// with the dark box — bg-background flips dark in prefers-color-scheme,
// which would merge the two. Shared with how-it-works.tsx and final-cta.tsx;
// founder-quote.tsx settled on bg-surface-2 instead.
export function PainBanner() {
  return (
    <section className="flex min-h-screen w-full snap-start flex-col justify-center bg-box-section px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 rounded-[2rem] bg-box px-6 py-16 text-center sm:px-16">
        <h2 className="max-w-2xl text-3xl font-black tracking-tight text-box-title uppercase sm:text-4xl">
          ¿Todavía llevás el service en una planilla o en las notas del
          celular?
        </h2>
        <p className="max-w-md text-lg text-box-desc">
          Cargá tu vehículo en pocos pasos y dejá de acordarte de memoria
          cuándo le hiciste qué.
        </p>
        <CreateVehicleLink />
      </div>
    </section>
  );
}
