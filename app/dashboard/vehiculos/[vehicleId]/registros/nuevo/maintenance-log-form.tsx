"use client";

import { createMaintenanceLogAction } from "@/app/dashboard/vehiculos/[vehicleId]/registros/nuevo/actions";
import { validateMaintenanceLogFields } from "@/lib/validation/maintenance-log";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { ComboboxField } from "@/components/ui/combobox-field";
import { DateField } from "@/components/ui/date-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/format";
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
    <Card
      as="form"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      padding="md"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <ComboboxField
        label="Mantenimiento realizado"
        name="maintenanceTypeId"
        placeholder="Elegí uno"
        options={maintenanceTypes.map((type) => ({
          value: type.id,
          label: type.name,
        }))}
        error={fieldErrors?.maintenanceTypeId}
      />

      <TextField
        label={`Valor al momento (${metricUnitLabel})`}
        name="performedAtValue"
        type="number"
        step="any"
        min={0}
        error={fieldErrors?.performedAtValue}
      />

      <DateField
        label="Fecha"
        name="performedAtDate"
        defaultValue={toDateInputValue(new Date())}
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
    </Card>
  );
}
