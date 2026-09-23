import { type SVGProps } from "react";
import type { VehicleType } from "@/lib/validation/vehicle";

function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

function AutoIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="M3 14.5c.4-1.2 1-2 1.8-2.3l1.3-.4 1.6-3.3A2 2 0 0 1 9.6 6.7h4.8a2 2 0 0 1 1.9 1.4l1.6 3.7 1.3.4c.8.3 1.4 1.1 1.8 2.3" />
      <path d="M3 14.5V16a1 1 0 0 0 1 1h.9" />
      <path d="M21 14.5V16a1 1 0 0 1-1 1h-.9" />
      <path d="M9.1 17h5.8" />
      <circle cx="7" cy="17" r="2.1" />
      <circle cx="17" cy="17" r="2.1" />
    </svg>
  );
}

// Motorcycle, not bicycle: flat tank/seat line, an engine block between the
// wheels and a high handlebar — no thin triangle frame.
function MotoIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <circle cx="5.5" cy="16.8" r="2.9" />
      <circle cx="18.5" cy="16.8" r="2.9" />
      <path d="M8.4 16.8h7.2" />
      <path d="M5.5 16.8 8.8 11.6" />
      <path d="M8.8 11.6h4.2" />
      <path d="M9.4 14h3.6v2.8H9.4z" />
      <path d="M13 11.6 15.4 8.6" />
      <path d="M15.4 8.6h3" />
      <path d="M17.2 10.4 18.5 16.8" />
    </svg>
  );
}

// Bicycle: thin triangle frame + seat + handlebar + a pedal crank at the
// bottom bracket — the pedal is what sets it apart from the moto icon.
function BicicletaIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <circle cx="6" cy="17" r="2.9" />
      <circle cx="18" cy="17" r="2.9" />
      <path d="M6 17 9.8 9.6h5.7L18 17" />
      <path d="m9.8 9.6 2.6 7.4" />
      <path d="M9.8 9.6 9 7.2H7.2" />
      <path d="M15.5 9.6 16.7 7h1.8" />
      <path d="M12.4 17v2.2" />
      <path d="M11.2 19.2h2.4" />
    </svg>
  );
}

function MonopatinIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="M16.8 4.5h3.4" />
      <path d="M18.2 4.5 16.6 16.4" />
      <path d="M7.3 18h7.5" />
      <circle cx="5.5" cy="18" r="1.7" />
      <circle cx="16.5" cy="18" r="1.7" />
    </svg>
  );
}

const ICONS: Record<
  VehicleType,
  (props: { className?: string }) => React.ReactNode
> = {
  auto: AutoIcon,
  moto: MotoIcon,
  bicicleta: BicicletaIcon,
  monopatin: MonopatinIcon,
};

export function VehicleTypeIcon({
  type,
  className,
}: {
  type: VehicleType;
  className?: string;
}) {
  const Icon = ICONS[type];
  return <Icon className={className} />;
}
