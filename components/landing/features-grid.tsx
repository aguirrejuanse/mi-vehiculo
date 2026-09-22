import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Feature = {
  title: string;
  body: string;
  // "muted" here reads as "En camino" — never "pronto" (reserved for
  // maintenance due-status, see lib/maintenance/next-due.ts).
  available: boolean;
};

const FEATURES: readonly Feature[] = [
  {
    title: "Horas o km, automático",
    body: "Elegimos la unidad según tu tipo de vehículo.",
    available: true,
  },
  {
    title: "Estado de tus mantenimientos",
    body: "Al día, pronto o vencido, actualizado siempre.",
    available: true,
  },
  {
    title: "Vincula repuestos a tus mantenimientos",
    body: "Cada repuesto queda ligado a lo que corresponde.",
    available: true,
  },
  {
    title: "Historial de mantenimiento",
    body: "Cada edición queda guardada, nunca se pierde el original.",
    available: true,
  },
  {
    title: "Todos tus vehículos",
    body: "Con tipo y subtipo propio.",
    available: true,
  },
  {
    title: "Recordatorios",
    body: "Aviso antes de que venza.",
    available: false,
  },
  {
    title: "Plan de mantenimiento sugerido",
    body: "Te armamos un plan al cargar tu vehículo.",
    available: false,
  },
  {
    title: "Cargá con una foto",
    body: "Sacale una foto al ticket y completamos el mantenimiento o repuesto.",
    available: false,
  },
  {
    title: "Creá grupos de vehículos",
    body: "Organizá tus vehículos como quieras.",
    available: false,
  },
  {
    title: "Creá grupos con tus amigos",
    body: "Compartí vehículos y mantenimiento con tu grupo.",
    available: false,
  },
];

export function FeaturesGrid() {
  return (
    <section className="flex min-h-screen snap-start flex-col justify-center gap-8">
      <h2 className="text-2xl font-black tracking-tight uppercase">
        Todo lo que hace{" "}
        <span className="text-primary">(y lo que viene)</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((feature) => (
          <Card key={feature.title} padding="md" className="flex flex-col gap-2">
            <Badge tone={feature.available ? "ok" : "muted"} className="self-start">
              {feature.available ? "Disponible" : "En camino"}
            </Badge>
            <h3 className="font-bold">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
