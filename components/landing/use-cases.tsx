import Link from "next/link";
import { Card } from "@/components/ui/card";
import { HERO_VARIANTS, type HeroVariant } from "@/lib/landing/hero-variants";

type UseCasesProps = {
  // Slug of the variant page currently being viewed (undefined on `/`). Its
  // card is shown highlighted instead of linking to itself.
  currentSlug?: string;
};

// Pure and exported so its capitalization edge cases (accents, already-cased
// input) are covered by a unit test without rendering anything.
export function capitalizeSubject(subject: string): string {
  if (subject.length === 0) return subject;
  return subject[0].toUpperCase() + subject.slice(1);
}

function PreviewItems({ variant }: { variant: HeroVariant }) {
  return (
    <ul className="flex flex-col gap-0.5 text-sm text-muted">
      {variant.items.slice(0, 2).map((item) => (
        <li key={item.name}>
          {item.name} · {item.interval}
        </li>
      ))}
    </ul>
  );
}

export function UseCases({ currentSlug }: UseCasesProps) {
  return (
    <section className="flex min-h-screen snap-start flex-col justify-center gap-8">
      <h2 className="text-2xl font-black tracking-tight uppercase">
        Hecho para lo que tenés en{" "}
        <span className="text-primary">el garaje</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HERO_VARIANTS.map((variant) => {
          const isCurrent = variant.slug === currentSlug;

          if (isCurrent) {
            return (
              <Card
                key={variant.slug}
                padding="md"
                className="flex flex-col gap-2 ring-2 ring-primary"
              >
                <h3 className="font-bold">
                  {capitalizeSubject(variant.subject)}
                </h3>
                <PreviewItems variant={variant} />
                <span className="text-sm font-bold text-primary">
                  Estás viendo esta
                </span>
              </Card>
            );
          }

          return (
            <Card
              key={variant.slug}
              as={Link}
              href={`/${variant.slug}`}
              padding="md"
              className="flex flex-col gap-2 transition-colors hover:border-primary"
            >
              <h3 className="font-bold">
                {capitalizeSubject(variant.subject)}
              </h3>
              <PreviewItems variant={variant} />
              <span className="text-sm font-bold text-primary">
                Ver ejemplo →
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
