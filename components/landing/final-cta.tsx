import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";

// Contiant "dark box" treatment, same pattern as pain-banner.tsx: an inset,
// inverted-contrast rounded card instead of an edge-to-edge tint. Uses the
// fixed bg-box/text-box-title/text-box-desc tokens, not bg-foreground/
// text-background — see globals.css's --color-box* tokens. The section
// itself uses bg-box-section, same fixed lavender-tinted off-white as
// pain-banner.tsx and how-it-works.tsx.
export function FinalCta() {
  return (
    <section
      id="empezar"
      className="flex min-h-screen w-full snap-start flex-col justify-center bg-box-section px-4 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 rounded-[2rem] bg-box px-6 py-16 text-center text-box-title sm:px-16">
        <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
          ¿Empezamos con tu vehículo?
        </h2>
        <p className="max-w-md text-lg text-box-desc">
          Es gratis y solo arrancás con tu email.
        </p>
        <CreateVehicleLink />
      </div>
    </section>
  );
}
