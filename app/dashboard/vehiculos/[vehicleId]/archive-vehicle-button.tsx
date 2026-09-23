"use client";

import { useActionState } from "react";
import {
  archiveVehicleAction,
  restoreVehicleAction,
} from "./actions";
import { FieldError } from "@/components/ui/field-error";

const INITIAL_STATE = { status: "idle" as const };

type ArchiveVehicleButtonProps = {
  vehicleId: string;
  isArchived: boolean;
};

export function ArchiveVehicleButton({
  vehicleId,
  isArchived,
}: ArchiveVehicleButtonProps) {
  const action = isArchived ? restoreVehicleAction : archiveVehicleAction;
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="vehicleId" value={vehicleId} />
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
