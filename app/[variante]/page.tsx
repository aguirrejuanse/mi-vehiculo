import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { HERO_VARIANTS, findHeroVariant } from "@/lib/landing/hero-variants";

// Anything that is not one of the variant slugs is a 404. Static routes
// (dashboard, nuevo, ...) take precedence over this dynamic segment.
export const dynamicParams = false;

export function generateStaticParams() {
  return HERO_VARIANTS.map((variant) => ({ variante: variant.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[variante]">): Promise<Metadata> {
  const { variante } = await params;
  const variant = findHeroVariant(variante);
  if (!variant) return {};

  return {
    title: `Mantenimiento de tu ${variant.subject} | Mi Vehículo`,
    description: `Todo lo que tu ${variant.subject} necesita en una app: creá tu vehículo, cargá lo que le hiciste y obtené lo próximo que debés hacerle.`,
  };
}

export default async function VariantPage({
  params,
}: PageProps<"/[variante]">) {
  const { variante } = await params;
  const variant = findHeroVariant(variante);
  if (!variant) notFound();

  return <LandingPage variant={variant} />;
}
