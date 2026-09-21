import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    title: "Registrá",
    description: "Todos tus vehículos, con su historial completo.",
  },
  {
    title: "Seguí",
    description: "Qué mantenimiento toca según horas o kilómetros.",
  },
  {
    title: "Repuestos",
    description: "De la wishlist a instalado, sin perder el hilo.",
  },
] as const;

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center gap-20 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-10">
        <div className="grid items-center gap-10 md:grid-cols-2 md:text-left">
          <div className="flex flex-col items-center gap-6 md:items-start">
            <h1 className="text-4xl leading-tight font-black tracking-tight uppercase md:text-5xl">
              Tu próximo service.
              <br />
              <span className="text-primary">Resuelto antes de que pase.</span>
            </h1>
            <p className="max-w-md text-lg text-muted">
              Cargá tu vehículo y listo: sabés qué toca y cuándo, sin
              planillas.
            </p>

            <Link
              href="/nuevo"
              className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
            >
              Crear tu vehículo
            </Link>
          </div>

          <Card className="flex flex-col gap-3 md:justify-self-end">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
                Próximo service
              </h2>
              <Badge tone="warn">Pronto</Badge>
            </div>
            <p className="text-left text-2xl font-bold">Cambio de aceite</p>
            <p className="text-left text-muted">En 320 km</p>
          </Card>
        </div>
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-1">
            <h3 className="font-bold text-primary">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
