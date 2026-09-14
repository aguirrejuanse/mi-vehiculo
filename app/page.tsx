import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 text-center dark:bg-black">
      <div className="flex max-w-xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Mi Vehículo
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Cargá tus vehículos, definí los mantenimientos periódicos (aceite,
          cadena, filtros...) y llevá el control de cuándo tocan según horas o
          kilómetros recorridos.
        </p>
      </div>

      <Show when="signed-out">
        <SignInButton>
          <button className="rounded-full bg-foreground px-6 py-3 text-base font-medium text-background">
            Empezar
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="rounded-full bg-foreground px-6 py-3 text-base font-medium text-background"
        >
          Ir al dashboard
        </Link>
      </Show>
    </div>
  );
}
