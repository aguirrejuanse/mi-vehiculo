"use client";

import { useEffect, useState, type RefObject } from "react";
import { toast } from "sonner";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import {
  isIdentifierExistsError,
  mapGuestAuthError,
} from "@/lib/auth/guest-auth-errors";
import { isValidEmail } from "@/lib/validation/email";
import { FieldError } from "@/components/ui/field-error";
import { inputClassName } from "@/components/ui/field-styles";

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

export type ConfirmPhase = "review" | "email" | "code";

type GuestAuthStepProps = {
  confirmPhase: ConfirmPhase;
  actionRef: RefObject<(() => void) | null>;
  onEmailSent: () => void;
  onVerified: () => void;
};

// Runs the guest auth sub-phase of "confirmar": collects an email, sends a
// verification code, then verifies it and finalizes the Clerk sign-up. If the
// email already has an account, the code is sent through the sign-in flow
// (mode "signin") automatically so the visitor never leaves the wizard. Both
// inputs are controlled state with no `name` attribute so they never enter
// the wizard's FormData (see design D4 / FormData section).
export function GuestAuthStep({
  confirmPhase,
  actionRef,
  onEmailSent,
  onVerified,
}: GuestAuthStepProps) {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  // Sign-up first; if Clerk says the email already has an account, switch to
  // the sign-in flow and send the code right away so the visitor never has to
  // ask for it (one less step). Resends stay in whichever mode was resolved.
  async function sendCode() {
    // Also guards the Enter-key path (actionRef), which bypasses the
    // button's disabled state.
    if (!isValidEmail(email) || isSubmitting) return;
    setGuestError(null);
    setIsSubmitting(true);
    try {
      let activeMode = mode;

      if (activeMode === "signup") {
        const { error: createError } = await signUp.create({
          emailAddress: email.trim(),
        });
        if (createError && !isIdentifierExistsError(createError)) {
          toast.error(mapGuestAuthError(createError));
          return;
        }

        if (createError) {
          activeMode = "signin";
          setMode("signin");
        } else {
          const { error: sendError } =
            await signUp.verifications.sendEmailCode();
          if (sendError) {
            toast.error(mapGuestAuthError(sendError));
            return;
          }
        }
      }

      if (activeMode === "signin") {
        const { error: sendError } = await signIn.emailCode.sendCode({
          emailAddress: email.trim(),
        });
        if (sendError) {
          toast.error(mapGuestAuthError(sendError));
          return;
        }
      }

      setResendSeconds(RESEND_SECONDS);
      toast.success(`Te enviamos un código a ${email.trim()}`);
      onEmailSent();
    } finally {
      setIsSubmitting(false);
    }
  }

  // Exposes this phase's primary action to the parent form's Enter-key
  // handler (design task 2.6) — the field inputs live inside the same
  // <form> as the rest of the wizard, so Enter must reach this action
  // instead of falling through to a bare (session-less) form submit.
  useEffect(() => {
    actionRef.current =
      confirmPhase === "code" ? verifyCode : () => void sendCode();
    return () => {
      actionRef.current = null;
    };
  });

  async function verifyCode() {
    // Also guards the Enter-key path (actionRef), which bypasses the
    // button's disabled state.
    if (code.length !== CODE_LENGTH || isSubmitting) return;
    setGuestError(null);
    setIsSubmitting(true);
    try {
      const { error: verifyError } =
        mode === "signin"
          ? await signIn.emailCode.verifyCode({ code })
          : await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setGuestError(mapGuestAuthError(verifyError));
        setCode("");
        return;
      }

      const { error: finalizeError } =
        mode === "signin" ? await signIn.finalize() : await signUp.finalize();
      if (finalizeError) {
        toast.error(mapGuestAuthError(finalizeError));
        return;
      }

      onVerified();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmPhase === "email") {
    return (
      <div className="wizard-step flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="guest-email"
            className="text-xs font-bold tracking-widest text-muted uppercase"
          >
            Tu email
          </label>
          <input
            id="guest-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vos@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName(Boolean(guestError))}
            aria-invalid={Boolean(guestError)}
          />
        </div>
        <FieldError message={guestError ?? undefined} />
        <button
          type="button"
          disabled={isSubmitting || !isValidEmail(email)}
          onClick={() => void sendCode()}
          className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-150 enabled:active:scale-[0.98] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar código"}
        </button>
      </div>
    );
  }

  if (confirmPhase === "code") {
    return (
      <div className="wizard-step flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="guest-code"
            className="text-xs font-bold tracking-widest text-muted uppercase"
          >
            Código de verificación
          </label>
          <input
            id="guest-code"
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
            }
            className={inputClassName(Boolean(guestError))}
            aria-invalid={Boolean(guestError)}
          />
        </div>
        <FieldError message={guestError ?? undefined} />
        {mode === "signin" ? (
          <p className="text-xs font-semibold text-muted">
            Ya tenés cuenta con ese mail. Te enviamos un código para iniciar
            sesión.
          </p>
        ) : null}
        <button
          type="button"
          disabled={isSubmitting || code.length !== CODE_LENGTH}
          onClick={verifyCode}
          className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-150 enabled:active:scale-[0.98] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Verificando..." : "Verificar código"}
        </button>
        <button
          type="button"
          disabled={resendSeconds > 0 || isSubmitting}
          onClick={() => void sendCode()}
          className="cursor-pointer text-xs font-bold tracking-widest text-muted uppercase transition duration-150 enabled:active:scale-[0.98] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendSeconds > 0
            ? `Reenviar código (${resendSeconds}s)`
            : "Reenviar código"}
        </button>
      </div>
    );
  }

  return null;
}
