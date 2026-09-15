"use client";

import { createVehicleAction } from "@/app/dashboard/vehiculos/nuevo/actions";
import { validateVehicleFields } from "@/lib/validation/vehicle";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";

const VEHICLE_TYPES = [
  { value: "moto", label: "Moto" },
  { value: "auto", label: "Auto" },
  { value: "bicicleta", label: "Bicicleta" },
  { value: "monopatin", label: "Monopatín" },
];

const METRIC_UNITS = [
  { value: "horas", label: "Horas" },
  { value: "km", label: "Kilómetros" },
];

export function VehicleForm() {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(createVehicleAction, validateVehicleFields);

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-sm border border-surface-border bg-surface/40 p-6"
    >
      <TextField
        label="Nombre"
        name="name"
        placeholder="Enduro 350"
        error={fieldErrors?.name}
      />

      <SelectField
        label="Tipo de vehículo"
        name="type"
        defaultValue=""
        error={fieldErrors?.type}
      >
        <option value="" disabled>
          Elegí un tipo
        </option>
        {VEHICLE_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Unidad de medida"
        name="metricUnit"
        defaultValue=""
        error={fieldErrors?.metricUnit}
      >
        <option value="" disabled>
          Elegí una unidad
        </option>
        {METRIC_UNITS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Valor actual"
        name="currentValue"
        type="number"
        step="any"
        min={0}
        defaultValue="0"
        error={fieldErrors?.currentValue}
      />

      <TextField
        label="Uso semanal estimado (opcional)"
        name="usageRatePerWeek"
        type="number"
        step="any"
        min={0}
        placeholder="Ej: 5"
        error={fieldErrors?.usageRatePerWeek}
      />

      <FieldError message={state.status === "error" ? state.message : undefined} />

      <SubmitButton
        isPending={isPending}
        label="Guardar vehículo"
        pendingLabel="Guardando..."
      />
    </form>
  );
}
