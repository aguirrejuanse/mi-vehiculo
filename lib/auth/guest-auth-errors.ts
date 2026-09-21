// Maps Clerk error codes to Spanish copy shown inline during the guest
// sign-up sub-phase of the vehicle wizard's "confirmar" step. Clerk's
// SignUpFuture methods (installed @clerk/react@6.15.2) resolve to
// `{ error: ClerkError | null }` instead of throwing. At runtime this is a
// ClerkAPIResponseError: the top-level `code` is always the generic
// "api_response_error" — the field-specific code (e.g. "form_identifier_exists")
// lives in `errors[0].code`, not in the top-level `code` the SDK's own .d.ts
// implies. Always read through `errors[0]` first, falling back to the
// top-level fields for shapes that don't nest.
export type GuestAuthError = {
  code: string;
  longMessage?: string | null;
  errors?: { code: string; longMessage?: string | null }[];
} | null;

const FALLBACK_MESSAGE = "No pudimos verificar el código. Probá de nuevo.";

function errorCode(error: GuestAuthError): string | undefined {
  return error?.errors?.[0]?.code ?? error?.code;
}

function errorLongMessage(error: GuestAuthError): string | null | undefined {
  return error?.errors?.[0]?.longMessage ?? error?.longMessage;
}

export function isIdentifierExistsError(error: GuestAuthError): boolean {
  return errorCode(error) === "form_identifier_exists";
}

export function mapGuestAuthError(error: GuestAuthError): string {
  if (!error) return FALLBACK_MESSAGE;

  switch (errorCode(error)) {
    case "form_code_incorrect":
      return "Ese código no es correcto. Revisalo y probá de nuevo.";
    case "verification_expired":
    case "verification_failed":
      return "El código venció. Pedí uno nuevo.";
    case "form_identifier_exists":
      return "Ya tenés cuenta con ese mail. Iniciá sesión con un código y guardamos tu vehículo.";
    case "too_many_requests":
      return "Demasiados intentos. Esperá un minuto y volvé a probar.";
    default:
      return errorLongMessage(error) ?? FALLBACK_MESSAGE;
  }
}
