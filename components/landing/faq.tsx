type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "¿Necesito crear una cuenta para probarlo?",
    answer: "No, se pide recién al confirmar el vehículo.",
  },
  {
    question: "¿Sirve para horas o solo para kilómetros?",
    answer: "Las dos, según el tipo de vehículo.",
  },
  {
    question: "¿Qué pasa si uso el vehículo más o menos de lo normal?",
    answer: "Se calcula por lo que venga primero, uso o calendario.",
  },
  {
    question: "¿Puedo cargar varios vehículos?",
    answer: "Sí, uno por cada uno, con su propio historial.",
  },
  {
    question: "¿Qué es el manejo de repuestos?",
    answer:
      "Guardás lo que querés comprar (wishlist), marcás cuando ya lo tenés para instalar, y registrás cuando ya está puesto. Así seguís cada repuesto de punta a punta.",
  },
  {
    question: "¿Puedo editar un registro si me equivoco?",
    answer: "Sí, y queda el historial de ediciones.",
  },
  {
    question: "¿Tienen app para el celular?",
    answer: "Todavía no, está en camino.",
  },
  {
    question: "¿Puedo cargar mantenimientos que ya hice?",
    answer:
      "Sí. Podés cargar un service o un cambio anterior con su fecha y su valor (horas o km). Así el historial queda completo desde el arranque.",
  },
];

// Pure so the schema shape is covered by a unit test without rendering.
// Next's recommended pattern for JSON-LD is a plain <script> tag (see
// node_modules/next/dist/docs/01-app/02-guides/json-ld.md) — `next/script` is
// for executable JS, not structured data.
export function buildFaqJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function Faq() {
  const jsonLd = buildFaqJsonLd(FAQ_ITEMS);

  return (
    <section
      id="preguntas-frecuentes"
      className="flex min-h-screen w-full scroll-mt-6 snap-start flex-col justify-center"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
          Preguntas <span className="text-primary">frecuentes</span>
        </h2>
        <div className="flex flex-col divide-y divide-surface-border">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-6">
              <summary className="cursor-pointer list-none text-lg font-bold marker:hidden">
                {item.question}
              </summary>
              {/* `grid` here is load-bearing: it's an author-origin rule, so
                  it beats the UA stylesheet's `details:not([open]) > *
                  { display: none }` regardless of the [open] attribute,
                  letting `grid-template-rows` (an animatable track-sizing
                  function, unlike `height: auto`) transition from 0fr to 1fr.
                  `overflow-hidden` clips the 0fr state to zero height. */}
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none group-open:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="mt-3 text-base text-muted">{item.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
        {/* JSON.stringify output is escaped to prevent XSS via `</script>` or
            similar breakout strings, per the Next.js JSON-LD guide. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </div>
    </section>
  );
}
