import type { MetadataRoute } from "next";
import { HERO_VARIANTS } from "@/lib/landing/hero-variants";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...HERO_VARIANTS.map((variant) => ({
      url: `${SITE_URL}/${variant.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
