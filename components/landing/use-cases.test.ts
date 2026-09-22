import { describe, expect, it } from "vitest";
import { capitalizeSubject } from "@/components/landing/use-cases";

describe("capitalizeSubject", () => {
  it("capitalizes the first letter only", () => {
    expect(capitalizeSubject("moto de enduro")).toBe("Moto de enduro");
  });

  it("keeps accented characters untouched", () => {
    expect(capitalizeSubject("bici eléctrica")).toBe("Bici eléctrica");
  });

  it("is a no-op on an already-capitalized subject", () => {
    expect(capitalizeSubject("Auto")).toBe("Auto");
  });

  it("handles an empty string without throwing", () => {
    expect(capitalizeSubject("")).toBe("");
  });
});
