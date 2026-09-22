import { describe, expect, it } from "vitest";
import { buildFaqJsonLd } from "@/components/landing/faq";

describe("buildFaqJsonLd", () => {
  const items = [
    { question: "¿Es gratis?", answer: "Sí, por ahora." },
    { question: "¿Puedo editar?", answer: "Sí." },
  ];

  it("wraps items in a schema.org FAQPage", () => {
    const jsonLd = buildFaqJsonLd(items);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(2);
  });

  it("maps each item to a Question/acceptedAnswer pair", () => {
    const jsonLd = buildFaqJsonLd(items);
    expect(jsonLd.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "¿Es gratis?",
      acceptedAnswer: { "@type": "Answer", text: "Sí, por ahora." },
    });
  });

  it("returns an empty mainEntity for no items", () => {
    expect(buildFaqJsonLd([]).mainEntity).toEqual([]);
  });
});
