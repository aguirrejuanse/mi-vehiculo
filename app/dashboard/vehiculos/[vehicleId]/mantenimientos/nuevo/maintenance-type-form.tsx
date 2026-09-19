"use client";

import { createMaintenanceTypeAction } from "@/app/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo/actions";
import { validateMaintenanceTypeFields } from "@/lib/validation/maintenance-type";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
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
        label={`Intervalo por uso (cada cuántos ${metricUnitLabel}, opcional)`}
        name="intervalValue"
        type="number"
        step="any"
        min={0}
        placeholder="Ej: 3000"
        error={fieldErrors?.intervalValue}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <TextField
            label="Intervalo por calendario (opcional)"
            name="intervalCalendarValue"
            type="number"
            step="1"
            min={0}
            placeholder="Ej: 6"
            error={fieldErrors?.intervalCalendarValue}
          />
        </div>

        <div className="flex-1">
          <SelectField
            label="Unidad"
            name="intervalCalendarUnit"
            defaultValue=""
            error={fieldErrors?.intervalCalendarUnit}
          >
            <option value="">Elegí una</option>
            <option value="dias">Días</option>
            <option value="meses">Meses</option>
          </SelectField>
        </div>
      </div>

      <FieldError message={state.status === "error" ? state.message : undefined} />

      <SubmitButton
        isPending={isPending}
        label="Guardar mantenimiento"
        pendingLabel="Guardando..."
      />
    </Card>
  );
}
