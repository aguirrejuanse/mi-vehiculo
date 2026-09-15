import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex max-w-xl flex-col gap-4">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Mi <span className="text-rb-red">Vehículo</span>
        </h1>
        <p className="text-lg text-rb-muted">
          Cargá tus vehículos, definí los mantenimientos periódicos (aceite,
          cadena, filtros...) y llevá el control de cuándo tocan según horas o
          kilómetros recorridos.
        </p>
      </div>

      <Show when="signed-out">
        <SignInButton>
          <button className="rounded-sm bg-rb-red px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover">
            Empezar
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="rounded-sm bg-rb-red px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
        >
          Ir al dashboard
        </Link>
      </Show>
    </div>
  );
}
