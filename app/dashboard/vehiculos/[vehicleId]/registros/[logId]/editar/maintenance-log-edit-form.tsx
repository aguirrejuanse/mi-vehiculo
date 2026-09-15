"use client";

import { updateMaintenanceLogAction } from "@/app/dashboard/vehiculos/[vehicleId]/registros/[logId]/editar/actions";
import { validateMaintenanceLogUpdateFields } from "@/lib/validation/maintenance-log";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";
import type { MaintenanceLogWithType } from "@/db/queries/maintenance-logs";

export function MaintenanceLogEditForm({
  vehicleId,
  metricUnitLabel,
  log,
}: {
  vehicleId: string;
  metricUnitLabel: string;
  log: MaintenanceLogWithType;
}) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(
      updateMaintenanceLogAction,
      validateMaintenanceLogUpdateFields,
    );

  const dateValue = new Date(log.performedAtDate).toISOString().slice(0, 10);

  return (
    <Card
      as="form"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      padding="md"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="logId" value={log.id} />

      <p className="text-xs font-bold tracking-widest text-rb-muted uppercase">
        {log.maintenanceType.name}
      </p>

      <TextField
        label={`Valor al momento (${metricUnitLabel})`}
        name="performedAtValue"
        type="number"
        step="any"
        min={0}
        defaultValue={log.performedAtValue}
        error={fieldErrors?.performedAtValue}
      />

      <TextField
        label="Fecha"
        name="performedAtDate"
        type="date"
        defaultValue={dateValue}
        error={fieldErrors?.performedAtDate}
      />

      <TextField
        label="Notas (opcional)"
        name="notes"
        placeholder="Detalles del trabajo"
        defaultValue={log.notes ?? ""}
        error={fieldErrors?.notes}
      />

      <FieldError
        message={state.status === "error" ? state.message : undefined}
      />

      <SubmitButton
        isPending={isPending}
        label="Guardar cambios"
        pendingLabel="Guardando..."
      />
    </Card>
  );
}
