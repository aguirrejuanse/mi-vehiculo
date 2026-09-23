"use client";

import { createMaintenanceTypeAction } from "@/app/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo/actions";
import { validateMaintenanceTypeFields } from "@/lib/validation/maintenance-type";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import type { ActionState } from "@/lib/validation/action-state";
import type { MaintenanceTypeInput } from "@/lib/validation/maintenance-type";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

type MaintenanceTypeFormAction = (
  prevState: ActionState<MaintenanceTypeInput>,
  formData: FormData,
) => Promise<ActionState<MaintenanceTypeInput>>;

export type MaintenanceTypeFormInitial = {
  name: string;
  intervalValue: string | null;
  intervalCalendarValue: number | null;
  intervalCalendarUnit: "dias" | "meses" | null;
};

export function MaintenanceTypeForm({
  vehicleId,
  metricUnitLabel,
  action = createMaintenanceTypeAction,
  typeId,
  initial,
  submitLabel = "Guardar mantenimiento",
}: {
  vehicleId: string;
  metricUnitLabel: string;
  action?: MaintenanceTypeFormAction;
  typeId?: string;
  initial?: MaintenanceTypeFormInitial;
  submitLabel?: string;
}) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(action, validateMaintenanceTypeFields);

  const noInterval =
    initial != null &&
    initial.intervalValue == null &&
    initial.intervalCalendarValue == null;

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
      {typeId ? <input type="hidden" name="typeId" value={typeId} /> : null}

      <TextField
        label="Nombre"
        name="name"
        placeholder="Cambio de aceite"
        defaultValue={initial?.name}
        error={fieldErrors?.name}
      />

      <CheckboxField
        label="Este mantenimiento no se repite (sin intervalo)"
        name="noInterval"
        defaultChecked={noInterval || undefined}
        error={fieldErrors?.noInterval}
      />

      <TextField
        label={`Intervalo por uso (cada cuántos ${metricUnitLabel}, opcional)`}
        name="intervalValue"
        type="number"
        step="any"
        min={0}
        placeholder="Ej: 3000"
        defaultValue={initial?.intervalValue ?? ""}
        error={fieldErrors?.intervalValue}
      />

      {/* Vertical below md (labels+inputs overflow side-by-side on narrow
          screens); items-end aligns the inputs when the left label wraps to
          two lines and "Unidad" stays on one. */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-3">
        <div className="flex-1">
          <TextField
            label="Intervalo por calendario (opcional)"
            name="intervalCalendarValue"
            type="number"
            step="1"
            min={0}
            placeholder="Ej: 6"
            defaultValue={initial?.intervalCalendarValue ?? ""}
            error={fieldErrors?.intervalCalendarValue}
          />
        </div>

        <div className="flex-1">
          <SelectField
            label="Unidad"
            name="intervalCalendarUnit"
            defaultValue={initial?.intervalCalendarUnit ?? ""}
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
        label={submitLabel}
        pendingLabel="Guardando..."
      />
    </Card>
  );
}
