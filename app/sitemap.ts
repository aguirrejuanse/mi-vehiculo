import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// NOTE: the task spec for this file expects `lib/landing/hero-variants.ts`
// (HERO_VARIANTS) to enumerate per-variant landing slugs, e.g. /[variante].
// That file lives on the not-yet-merged feat/landing-home-redesign branch
// and doesn't exist on master, where this branch was cut from. Once it
// merges, add the variant slugs here:
//
//   import { HERO_VARIANTS } from "@/lib/landing/hero-variants";
//   ...HERO_VARIANTS.map((variant) => ({ url: `${SITE_URL}/${variant.slug}` }))
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
