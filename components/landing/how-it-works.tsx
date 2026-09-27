import { CreateVehicleLink } from "@/components/landing/create-vehicle-link";

type Step = {
  number: string;
  title: string;
  body: string;
};

const STEPS: readonly Step[] = [
  {
    number: "01",
    title: "Creá tu vehículo",
    body: "Tipo, nombre y cuánto lleva usado.",
  },
  {
    number: "02",
    title: "Definí sus mantenimientos",
    body: "Cargá qué le hacés y cada cuánto: en horas, km o meses.",
  },
  {
    number: "03",
    title: "Registrá y mirá qué toca",
    body: "Anotá lo que le hacés y te mostramos el próximo vencimiento.",
  },
];

// Contiant "dark box" treatment, same inset-card pattern and same fixed
// bg-box/text-box-title/text-box-desc tokens as pain-banner.tsx, final-cta.tsx
// and founder-quote.tsx — not bg-foreground/text-background, see globals.css's
// --color-box* tokens. Not adjacent to pain-banner.tsx in scroll order
// (Wizard sits between them), so repeating the pattern is fine. The section
// itself uses bg-box-section, same fixed lavender-tinted off-white as
// pain-banner.tsx and final-cta.tsx.
export function HowItWorks({ hash }: { hash?: string }) {
  return (
    <section
      id="como-funciona"
      className="flex min-h-screen w-full scroll-mt-20 snap-start flex-col justify-center bg-box-section px-4 py-12 sm:px-6 md:py-16"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-[2rem] bg-box px-6 py-16 sm:px-16">
        <h2 className="text-3xl font-black tracking-tight text-box-title uppercase sm:text-4xl">
          Cómo{" "}
          <span className="block text-primary sm:inline">funciona</span>
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col gap-2">
              <span className="text-5xl font-black text-primary">
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-box-title">
                {step.title}
              </h3>
              <p className="text-base text-box-desc">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="self-center">
          <CreateVehicleLink hash={hash} />
        </div>
      </div>
    </section>
  );
}
