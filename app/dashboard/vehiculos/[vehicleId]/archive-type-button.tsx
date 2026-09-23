"use client";

import { useActionState } from "react";
import {
  archiveMaintenanceTypeAction,
  restoreMaintenanceTypeAction,
} from "./actions";
import { FieldError } from "@/components/ui/field-error";

const INITIAL_STATE = { status: "idle" as const };

type ArchiveTypeButtonProps = {
  typeId: string;
  vehicleId: string;
  isArchived: boolean;
};

export function ArchiveTypeButton({
  typeId,
  vehicleId,
  isArchived,
}: ArchiveTypeButtonProps) {
  const action = isArchived
    ? restoreMaintenanceTypeAction
    : archiveMaintenanceTypeAction;
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="typeId" value={typeId} />
      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-full border border-surface-border px-3 py-1 text-xs font-bold tracking-widest text-foreground uppercase transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? isArchived
            ? "Restaurando..."
            : "Archivando..."
          : isArchived
            ? "Restaurar"
            : "Archivar"}
      </button>
      <FieldError message={state.message} />
    </form>
  );
}
