"use client";

import { useActionState } from "react";
import { advancePartStatusAction } from "./actions";
import { FieldError } from "@/components/ui/field-error";
import type { PartStatus } from "@/lib/validation/part";

const INITIAL_STATE = { status: "idle" as const };

type AdvancePartButtonProps = {
  partId: string;
  vehicleId: string;
  currentStatus: PartStatus;
  label: string;
};

// Zero-field mutation: the only datum is *which* part, already known at
// render. No dedicated page/form, no `useActionFormState` (that hook exists
// to run client-side validation before submit — there's nothing to
// validate here). Not `SubmitButton`: that's a full-width block CTA, wrong
// shape for an inline card action.
export function AdvancePartButton({
  partId,
  vehicleId,
  currentStatus,
  label,
}: AdvancePartButtonProps) {
  const [state, formAction, isPending] = useActionState(
    advancePartStatusAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="partId" value={partId} />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="expectedStatus" value={currentStatus} />
      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-full border border-surface-border px-3 py-1 text-xs font-bold tracking-widest text-foreground uppercase transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Avanzando..." : label}
      </button>
      <FieldError message={state.message} />
    </form>
  );
}
