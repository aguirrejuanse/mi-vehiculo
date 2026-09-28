"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "@/components/ui/toast";
import {
  isIdentifierExistsError,
  mapGuestAuthError,
} from "@/lib/auth/guest-auth-errors";
import { isValidEmail } from "@/lib/validation/email";
import { FieldError } from "@/components/ui/field-error";
import { inputClassName } from "@/components/ui/field-styles";
import { track } from "@/lib/analytics/client";

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

type Phase = "email" | "code";

// Standalone email+code auth flow for /sign-in — same interaction pattern as
// app/nuevo/guest-auth-step.tsx (embedded, no redirect to Clerk's hosted
// pages), but self-driving its own phase state instead of being orchestrated
// by the wizard's confirmar step. Sign-up and sign-in share this one form:
// Clerk tells us via `form_identifier_exists` whether the email already has
// an account, and we silently switch flows instead of asking the visitor to
// pick upfront.
export function InlineAuthForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const [phase, setPhase] = useState<Phase>("email");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  async function sendCode() {
    if (!isValidEmail(email) || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      let activeMode = mode;

      if (activeMode === "signup") {
        const { error: createError } = await signUp.create({
          emailAddress: email.trim(),
        });
        if (createError && !isIdentifierExistsError(createError)) {
          toast.add({ type: "error", title: mapGuestAuthError(createError) });
          return;
        }

        if (createError) {
          activeMode = "signin";
          setMode("signin");
        } else {
          const { error: sendError } =
            await signUp.verifications.sendEmailCode();
          if (sendError) {
            toast.add({ type: "error", title: mapGuestAuthError(sendError) });
            return;
          }
        }
      }

      if (activeMode === "signin") {
        const { error: sendError } = await signIn.emailCode.sendCode({
          emailAddress: email.trim(),
        });
        if (sendError) {
          toast.add({ type: "error", title: mapGuestAuthError(sendError) });
          return;
        }
      }

      setResendSeconds(RESEND_SECONDS);
      toast.add({
        type: "success",
        title: "Te enviamos un código a",
        description: email.trim(),
      });
      setPhase("code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (code.length !== CODE_LENGTH || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: verifyError } =
        mode === "signin"
          ? await signIn.emailCode.verifyCode({ code })
          : await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(mapGuestAuthError(verifyError));
        setCode("");
        return;
      }

      const { error: finalizeError } =
        mode === "signin" ? await signIn.finalize() : await signUp.finalize();
      if (finalizeError) {
        toast.add({ type: "error", title: mapGuestAuthError(finalizeError) });
        return;
      }

      // The guest wizard and race checklist fire this on their own flows —
      // sign-ups through /ingresar would otherwise never reach the funnel.
      if (mode === "signup") {
        track("account_created", { source: "ingresar" });
      }

      router.push(redirectTo);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (phase === "email") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-email"
            className="text-xs font-bold tracking-widest text-muted uppercase"
          >
            Tu email
          </label>
          <input
            id="auth-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vos@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void sendCode()}
            className={inputClassName(Boolean(error))}
            aria-invalid={Boolean(error)}
          />
        </div>
        <FieldError message={error ?? undefined} />
        <button
          type="button"
          disabled={isSubmitting || !isValidEmail(email)}
          onClick={() => void sendCode()}
          className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-[var(--duration-quick)] enabled:active:scale-[0.98] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Continuar"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="auth-code"
          className="text-xs font-bold tracking-widest text-muted uppercase"
        >
          Código de verificación
        </label>
        <input
          id="auth-code"
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          onKeyDown={(event) => event.key === "Enter" && void verifyCode()}
          className={inputClassName(Boolean(error))}
          aria-invalid={Boolean(error)}
        />
      </div>
      <FieldError message={error ?? undefined} />
      {mode === "signin" ? (
        <p className="text-xs font-semibold text-muted">
          Ya tenés cuenta con ese mail. Te enviamos un código para iniciar
          sesión.
        </p>
      ) : null}
      <button
        type="button"
        disabled={isSubmitting || code.length !== CODE_LENGTH}
        onClick={() => void verifyCode()}
        className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-[var(--duration-quick)] enabled:active:scale-[0.98] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verificando..." : "Verificar código"}
      </button>
      <button
        type="button"
        disabled={resendSeconds > 0 || isSubmitting}
        onClick={() => void sendCode()}
        className="cursor-pointer text-xs font-bold tracking-widest text-muted uppercase transition duration-[var(--duration-quick)] enabled:active:scale-[0.98] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resendSeconds > 0
          ? `Reenviar código (${resendSeconds}s)`
          : "Reenviar código"}
      </button>
    </div>
  );
}
