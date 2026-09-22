import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";
import type { HeroVariant } from "@/lib/landing/hero-variants";

type HeroProps = {
  variants: readonly HeroVariant[];
  activeIndex: number;
};

const ITEM_STAGGER_MS = 60;

// Every variant is rendered in the same grid cell so the cell (and therefore
// the H1 width and the card height) always matches the largest one: swapping
// the active variant never shifts the layout. Only the active one is exposed
// to assistive tech.
const WORD_CLASSES =
  "col-start-1 row-start-1 transition-[opacity,transform,filter,visibility] duration-500 ease-out motion-reduce:transition-none";

function wordStateClasses(isActive: boolean) {
  return isActive
    ? "translate-y-0 opacity-100 blur-0"
    : "invisible translate-y-2 opacity-0 blur-sm";
}

// The <ul> only toggles visibility (delayed on exit by the transition
// duration) so the items can fade and slide on their own, staggered.
const LIST_CLASSES =
  "col-start-1 row-start-1 flex flex-col divide-y divide-surface-border transition-[visibility] duration-500 motion-reduce:transition-none";

const ITEM_CLASSES =
  "flex flex-col gap-0.5 py-3 transition-[opacity,transform] duration-500 ease-out first:pt-0 last:pb-0 motion-reduce:transition-none sm:flex-row sm:items-baseline sm:justify-between sm:gap-4";

function itemStateClasses(isActive: boolean) {
  return isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";
}

export function Hero({ variants, activeIndex }: HeroProps) {
  return (
    <div className="grid min-h-screen snap-start content-center items-center gap-10 md:grid-cols-2">
      <div className="flex flex-col items-start gap-6">
        <h1 className="text-3xl leading-tight font-black tracking-tight uppercase sm:text-4xl lg:text-5xl">
          Todo lo que tu{" "}
          <span className="inline-grid text-left text-primary">
            {variants.map((variant, index) => (
              <span
                key={variant.slug}
                aria-hidden={index !== activeIndex || undefined}
                className={`${WORD_CLASSES} ${wordStateClasses(index === activeIndex)}`}
              >
                {variant.subject}
              </span>
            ))}
          </span>{" "}
          necesita en una app
        </h1>
        <p className="max-w-md text-lg text-muted">
          Creá tu vehículo, cargá lo que le hiciste y obtené lo próximo que
          debés hacerle.
        </p>
        <CreateVehicleLink />
      </div>

      <Card
        padding="md"
        className="flex w-full max-w-md flex-col gap-4 md:justify-self-end"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
            Próximos mantenimientos
          </h2>
          <Badge tone="muted">Ejemplo</Badge>
        </div>
        <div className="grid">
          {variants.map((variant, index) => {
            const isActive = index === activeIndex;
            return (
              <ul
                key={variant.slug}
                aria-hidden={!isActive || undefined}
                className={`${LIST_CLASSES} ${isActive ? "visible" : "invisible"}`}
              >
                {variant.items.map((item, itemIndex) => (
                  <li
                    key={item.name}
                    style={{
                      transitionDelay: isActive
                        ? `${itemIndex * ITEM_STAGGER_MS}ms`
                        : "0ms",
                    }}
                    className={`${ITEM_CLASSES} ${itemStateClasses(isActive)}`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm text-muted sm:text-right">
                      {item.interval}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          Ejemplos: los intervalos varían según el modelo.
        </p>
      </Card>
    </div>
  );
}
