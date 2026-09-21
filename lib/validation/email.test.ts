import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/validation/email";

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("vos@ejemplo.com")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isValidEmail("  vos@ejemplo.com ")).toBe(true);
  });

  it.each(["", "vos", "vos@", "@ejemplo.com", "vos@ejemplo", "vos @ejemplo.com"])(
    "rejects %j",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});
