import { type ReactNode, type SVGProps } from "react";

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
    className: "size-7",
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

// Full-bleed section, same pattern as pain-banner.tsx: bg-surface-2 blends
// softer than the plain page background so the cards below don't read as
// stark white boxes floating on it. The cards themselves drop the
// border+shadow the ui/card.tsx default uses elsewhere — on this backdrop
// that combo read as excess edge-contrast, per user feedback — and rely on
// spacing + a lighter fill to separate instead. Tried the same dark-box
// treatment used elsewhere (pain-banner, how-it-works, founder-quote,
// final-cta) here too, A/B'd live against this flat version — user picked
// flat, so this section stays outside the dark-box rotation. Also tried
// tinting these cards (bg-teal-soft) — user rejected it, they're plain
// bg-surface again.
export function Benefits() {
  return (
    <section className="flex min-h-screen w-full snap-start flex-col justify-center bg-surface-2">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
          Por qué{" "}
          <span className="block text-primary sm:inline">Mi Vehículo</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col gap-4 rounded-3xl bg-surface p-8"
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary-soft text-primary">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold">{benefit.title}</h3>
              <p className="text-base text-muted">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
