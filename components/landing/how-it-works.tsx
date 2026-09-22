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

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="flex min-h-screen scroll-mt-6 snap-start flex-col justify-center gap-8"
    >
      <h2 className="text-2xl font-black tracking-tight uppercase">
        Cómo <span className="text-primary">funciona</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col gap-1">
            <span className="text-3xl font-black text-primary-soft">
              {step.number}
            </span>
            <h3 className="font-bold">{step.title}</h3>
            <p className="text-sm text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
