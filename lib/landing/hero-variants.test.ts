import { describe, expect, it } from "vitest";
import {
  DEFAULT_HERO_VARIANT,
  HERO_VARIANTS,
  findHeroVariant,
} from "@/lib/landing/hero-variants";

// Top-level routes that a variant slug must never shadow.
const RESERVED_ROUTES = ["dashboard", "nuevo", "api", "sign-in", "sign-up"];

describe("HERO_VARIANTS", () => {
  it("starts with the moto de enduro variant", () => {
    expect(HERO_VARIANTS[0].slug).toBe("moto-enduro");
    expect(DEFAULT_HERO_VARIANT).toBe(HERO_VARIANTS[0]);
  });

  it("has unique slugs", () => {
    const slugs = HERO_VARIANTS.map((variant) => variant.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(HERO_VARIANTS.map((variant) => variant.slug))(
    "uses a url-safe slug that is not a reserved route: %s",
    (slug) => {
      expect(slug).toMatch(/^[a-z-]+$/);
      expect(RESERVED_ROUTES).not.toContain(slug);
    },
  );

  it.each(HERO_VARIANTS.map((variant) => [variant.slug, variant] as const))(
    "has a subject and at least one complete item: %s",
    (_slug, variant) => {
      expect(variant.subject.trim()).not.toBe("");
      expect(variant.items.length).toBeGreaterThanOrEqual(1);
      for (const item of variant.items) {
        expect(item.name.trim()).not.toBe("");
        expect(item.interval.trim()).not.toBe("");
      }
    },
  );
});

describe("findHeroVariant", () => {
  it("returns the variant for a known slug", () => {
    expect(findHeroVariant("auto")?.subject).toBe("auto");
  });

  it("returns undefined for an unknown slug", () => {
    expect(findHeroVariant("dashboard")).toBeUndefined();
  });
});
