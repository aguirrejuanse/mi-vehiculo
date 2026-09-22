import { type ReactNode, type SVGProps } from "react";
import { Card } from "@/components/ui/card";

type Benefit = {
  title: string;
  body: string;
  icon: ReactNode;
};

// Minimal stroke icons, no icon library: 24x24, currentColor, matching the
// line-art weight used elsewhere in the app.
function iconProps(): SVGProps<SVGSVGElement> {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "size-6",
  };
}

function GaugeIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13l3.5-3.5" />
      <path d="M9 5.5V4M15 5.5V4M4 13H2.5M21.5 13H20" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3.5 8.5l8.5-4 8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 8.5V16l8.5 4 8.5-4V8.5" />
      <path d="M12 12.5V20" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 6h14v14H5z" />
      <path d="M8 3v4M16 3v4M5 10h14" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

const BENEFITS: readonly Benefit[] = [
  {
    title: "Sabés qué toca y cuándo",
    body: "Horas, kilómetros o meses: lo que llegue primero. Ves qué falta para el próximo mantenimiento.",
    icon: <GaugeIcon />,
  },
  {
    title: "Tus repuestos, bajo control",
    body: "Anotá lo que querés comprar, marcá lo que ya tenés para instalar y registrá cuando ya está puesto. Cada repuesto sigue su camino de wishlist a instalado.",
    icon: <BoxIcon />,
  },
  {
    title: "Tu vehículo al día",
    body: "Todo lo que le hiciste queda en el historial, con cada edición registrada. Para la próxima carrera o para vender.",
    icon: <HistoryIcon />,
  },
];

export function Benefits() {
  return (
    <div className="grid min-h-screen snap-start content-center gap-6 md:grid-cols-3">
      {BENEFITS.map((benefit) => (
        <Card key={benefit.title} padding="md" className="flex flex-col gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            {benefit.icon}
          </div>
          <h3 className="font-bold">{benefit.title}</h3>
          <p className="text-sm text-muted">{benefit.body}</p>
        </Card>
      ))}
    </div>
  );
}
