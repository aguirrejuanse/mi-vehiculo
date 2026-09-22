import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";

// Full-bleed section, same pattern as pain-banner.tsx.
export function FinalCta() {
  return (
    <section className="flex min-h-screen w-full snap-start flex-col justify-center bg-primary-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-black tracking-tight uppercase">
          ¿Empezamos con tu vehículo?
        </h2>
        <p className="max-w-md text-muted">
          Es gratis y solo arrancás con tu email.
        </p>
        <CreateVehicleLink />
      </div>
    </section>
  );
}
