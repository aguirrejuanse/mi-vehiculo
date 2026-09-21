import { describe, expect, it } from "vitest";
import {
  isIdentifierExistsError,
  mapGuestAuthError,
} from "@/lib/auth/guest-auth-errors";

describe("mapGuestAuthError", () => {
  it("maps form_code_incorrect", () => {
    expect(mapGuestAuthError({ code: "form_code_incorrect" })).toBe(
      "Ese código no es correcto. Revisalo y probá de nuevo.",
    );
  });

  it("maps verification_expired", () => {
    expect(mapGuestAuthError({ code: "verification_expired" })).toBe(
      "El código venció. Pedí uno nuevo.",
    );
  });

  it("maps verification_failed to the same copy as verification_expired", () => {
    expect(mapGuestAuthError({ code: "verification_failed" })).toBe(
      "El código venció. Pedí uno nuevo.",
    );
  });

  it("maps form_identifier_exists", () => {
    expect(mapGuestAuthError({ code: "form_identifier_exists" })).toBe(
      "Ya tenés cuenta con ese mail. Iniciá sesión y cargá el vehículo desde tu panel.",
    );
  });

  it("maps the nested errors[0].code shape, which is what Clerk actually returns at runtime (top-level code is always api_response_error)", () => {
    expect(
      mapGuestAuthError({
        code: "api_response_error",
        errors: [
          {
            code: "form_identifier_exists",
            longMessage: "That email address is taken. Please try another.",
          },
        ],
      }),
    ).toBe(
      "Ya tenés cuenta con ese mail. Iniciá sesión y cargá el vehículo desde tu panel.",
    );
  });

  it("maps too_many_requests", () => {
    expect(mapGuestAuthError({ code: "too_many_requests" })).toBe(
      "Demasiados intentos. Esperá un minuto y volvé a probar.",
    );
  });

  it("falls back to longMessage for unknown codes", () => {
    expect(
      mapGuestAuthError({
        code: "some_unmapped_code",
        longMessage: "Detalle específico del servidor.",
      }),
    ).toBe("Detalle específico del servidor.");
  });

  it("falls back to the generic message when there is no longMessage", () => {
    expect(mapGuestAuthError({ code: "some_unmapped_code" })).toBe(
      "No pudimos verificar el código. Probá de nuevo.",
    );
  });

  it("falls back to the generic message when error is null", () => {
    expect(mapGuestAuthError(null)).toBe(
      "No pudimos verificar el código. Probá de nuevo.",
    );
  });
});

describe("isIdentifierExistsError", () => {
  it("recognizes the generic code", () => {
    expect(isIdentifierExistsError({ code: "form_identifier_exists" })).toBe(
      true,
    );
  });

  it("recognizes the nested errors[0].code shape Clerk actually returns", () => {
    expect(
      isIdentifierExistsError({
        code: "api_response_error",
        errors: [{ code: "form_identifier_exists" }],
      }),
    ).toBe(true);
  });

  it("returns false for unrelated codes", () => {
    expect(isIdentifierExistsError({ code: "form_code_incorrect" })).toBe(
      false,
    );
  });

  it("returns false for null", () => {
    expect(isIdentifierExistsError(null)).toBe(false);
  });
});
