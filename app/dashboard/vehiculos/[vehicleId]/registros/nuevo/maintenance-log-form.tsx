"use client";

import { createMaintenanceLogAction } from "@/app/dashboard/vehiculos/[vehicleId]/registros/nuevo/actions";
import { validateMaintenanceLogFields } from "@/lib/validation/maintenance-log";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import type { MaintenanceType } from "@/db/schema";

export function MaintenanceLogForm({
  vehicleId,
  metricUnitLabel,
  maintenanceTypes,
}: {
  vehicleId: string;
  metricUnitLabel: string;
  maintenanceTypes: MaintenanceType[];
}) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(
      createMaintenanceLogAction,
      validateMaintenanceLogFields,
    );

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-sm border border-surface-border bg-surface/40 p-6"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <SelectField
        label="Mantenimiento realizado"
        name="maintenanceTypeId"
        defaultValue=""
        error={fieldErrors?.maintenanceTypeId}
      >
        <option value="" disabled>
          Elegí uno
        </option>
        {maintenanceTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </SelectField>

      <TextField
        label={`Valor al momento (${metricUnitLabel})`}
        name="performedAtValue"
        type="number"
        step="any"
        min={0}
        error={fieldErrors?.performedAtValue}
      />

      <TextField
        label="Fecha"
        name="performedAtDate"
        type="date"
        error={fieldErrors?.performedAtDate}
      />

      <TextField
        label="Notas (opcional)"
        name="notes"
        placeholder="Detalles del trabajo"
        error={fieldErrors?.notes}
      />

      <FieldError message={state.status === "error" ? state.message : undefined} />

      <SubmitButton
        isPending={isPending}
        label="Guardar registro"
        pendingLabel="Guardando..."
      />
    </form>
  );
}
