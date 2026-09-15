"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { ActionState } from "@/lib/validation/action-state";

type ValidateFn<T> = (
  formData: FormData,
) => Partial<Record<keyof T & string, string>> | null;

const idleState: ActionState<unknown> = { status: "idle" };

export function useActionFormState<T>(
  action: (
    prevState: ActionState<T>,
    formData: FormData,
  ) => Promise<ActionState<T>>,
  validate: ValidateFn<T>,
) {
  const [state, formAction, isPending] = useActionState(
    action,
    idleState as ActionState<T>,
  );
  const [clientErrors, setClientErrors] = useState<Partial<
    Record<keyof T & string, string>
  > | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const errors = validate(formData);
    if (errors && Object.keys(errors).length > 0) {
      event.preventDefault();
      setClientErrors(errors);
      return;
    }
    setClientErrors(null);
  }

  function clearFieldError(field: keyof T & string) {
    setClientErrors((prev) => {
      if (!prev?.[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const fieldErrors = clientErrors ?? state.fieldErrors;

  return { state, formAction, isPending, handleSubmit, clearFieldError, fieldErrors };
}
