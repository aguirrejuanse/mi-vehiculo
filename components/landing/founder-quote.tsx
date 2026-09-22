export function FounderQuote() {
  return (
    <figure className="mx-auto flex min-h-screen max-w-2xl snap-start flex-col items-center justify-center gap-4 text-center">
      {/* Placeholder for the founder's photo — pending asset, not built yet.
          When available: <Image src="/juanse.jpg" alt="" width={64} height={64} className="rounded-full" /> */}
      <div className="size-16 rounded-full bg-surface-2" />
      <blockquote className="text-lg text-muted">
        “Ando en moto y bicicleta. Empecé a anotar el mantenimiento en una
        libreta, después en el celular, y siempre terminaba perdiendo el
        registro o me olvidaba de algo. Más las motos de mi papá y mi
        hermana, se hacía difícil seguir con algo prolijo. Armé Mi Vehículo
        para no tener que acordarme yo.”
      </blockquote>
      <figcaption className="text-sm font-bold">
        — Juanse, creador de Mi Vehículo
      </figcaption>
    </figure>
  );
}
