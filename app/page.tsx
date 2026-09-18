import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex max-w-xl flex-col gap-4">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Mi <span className="text-primary">Vehículo</span>
        </h1>
        <p className="text-lg text-muted">
          Cargá tus vehículos, definí los mantenimientos periódicos (aceite,
          cadena, filtros...) y llevá el control de cuándo tocan según horas o
          kilómetros recorridos.
        </p>
      </div>

      <SignUpButton forceRedirectUrl="/dashboard/vehiculos/nuevo">
        <button className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover">
          Crear tu vehículo
        </button>
      </SignUpButton>
    </div>
  );
}
