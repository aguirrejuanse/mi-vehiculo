// Maps Clerk error codes to Spanish copy shown inline during the guest
// sign-up sub-phase of the vehicle wizard's "confirmar" step. Clerk's
// SignUpFuture methods (installed @clerk/react@6.15.2) resolve to
// `{ error: ClerkError | null }` instead of throwing — callers pass that
// `error.code` / `error.longMessage` straight in, no try/catch needed.
export type GuestAuthError = {
  code: string;
  longMessage?: string | null;
} | null;

const FALLBACK_MESSAGE = "No pudimos verificar el código. Probá de nuevo.";

export function mapGuestAuthError(error: GuestAuthError): string {
  if (!error) return FALLBACK_MESSAGE;

  switch (error.code) {
    case "form_code_incorrect":
      return "Ese código no es correcto. Revisalo y probá de nuevo.";
    case "verification_expired":
    case "verification_failed":
      return "El código venció. Pedí uno nuevo.";
    case "form_identifier_exists":
      return "Ya tenés cuenta con ese mail. Iniciá sesión y cargá el vehículo desde tu panel.";
    case "too_many_requests":
      return "Demasiados intentos. Esperá un minuto y volvé a probar.";
    default:
      return error.longMessage ?? FALLBACK_MESSAGE;
  }
}
