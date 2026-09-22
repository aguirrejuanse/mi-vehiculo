// Contiant "dark box" treatment, same pattern as pain-banner.tsx: an inset,
// inverted-contrast rounded card instead of an edge-to-edge tint or a
// bordered box. Uses the fixed bg-box/text-box-title tokens, not
// bg-foreground/text-background — see globals.css's --color-box* tokens. The
// photo placeholder uses a translucent bg-box-title chip so it reads as a
// circle on the dark box without needing its own token. The section itself
// settled on bg-surface-2 (#faf9fe, same token Benefits uses) instead of
// bg-box-section — user preferred it flat here specifically.
export function FounderQuote() {
  return (
    <section
      id="testimonios"
      className="flex min-h-screen w-full scroll-mt-20 snap-start flex-col justify-center bg-surface-2 px-4 sm:px-6"
    >
      <figure className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[2rem] bg-box px-6 py-16 text-center text-box-title sm:px-16">
        {/* Placeholder for the founder's photo — pending asset, not built yet.
            When available: <Image src="/juanse.jpg" alt="" width={96} height={96} className="rounded-full" /> */}
        <div className="size-24 rounded-full bg-box-title/15" />
        <blockquote className="text-2xl opacity-90 sm:text-3xl">
          “Ando en moto y bicicleta. Empecé a anotar el mantenimiento en una
          libreta, después en el celular, y siempre terminaba perdiendo el
          registro o me olvidaba de algo. Más las motos de mi papá y mi
          hermana, se hacía difícil seguir con algo prolijo. Armé Mi Vehículo
          para no tener que acordarme yo.”
        </blockquote>
        <figcaption className="text-base font-bold">
          — Juanse, creador de Mi Vehículo
        </figcaption>
      </figure>
    </section>
  );
}
