import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";

// Full-bleed section: breaks out of the page's max-w-5xl wrapper (it's
// rendered at the top level in landing-page.tsx) so the background spans the
// viewport, while the inner container keeps the same content width/gutters.
export function PainBanner() {
  return (
    <section className="flex min-h-screen w-full snap-start flex-col justify-center bg-accent-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h2 className="max-w-2xl text-2xl font-black tracking-tight uppercase">
          ¿Todavía llevás el service en una planilla o en las notas del
          celular?
        </h2>
        <p className="max-w-md text-muted">
          Cargá tu vehículo en pocos pasos y dejá de acordarte de memoria
          cuándo le hiciste qué.
        </p>
        <CreateVehicleLink />
      </div>
    </section>
  );
}
