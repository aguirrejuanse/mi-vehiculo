"use client";

import { createMaintenanceTypeAction } from "@/app/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo/actions";
import { validateMaintenanceTypeFields } from "@/lib/validation/maintenance-type";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

export function MaintenanceTypeForm({
  vehicleId,
  metricUnitLabel,
}: {
  vehicleId: string;
  metricUnitLabel: string;
}) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(
      createMaintenanceTypeAction,
      validateMaintenanceTypeFields,
    );

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

      <TextField
        label="Nombre"
        name="name"
        placeholder="Cambio de aceite"
        error={fieldErrors?.name}
      />

      <TextField
        label={`Intervalo (cada cuántos ${metricUnitLabel})`}
        name="intervalValue"
        type="number"
        step="any"
        min={0}
        placeholder="Ej: 3000"
        error={fieldErrors?.intervalValue}
      />

      <FieldError message={state.status === "error" ? state.message : undefined} />

      <SubmitButton
        isPending={isPending}
        label="Guardar mantenimiento"
        pendingLabel="Guardando..."
      />
    </Card>
  );
}
