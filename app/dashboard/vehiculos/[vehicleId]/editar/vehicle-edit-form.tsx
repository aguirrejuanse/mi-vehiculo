"use client";

import { updateVehicleAction } from "@/app/dashboard/vehiculos/[vehicleId]/editar/actions";
import { validateVehicleUpdateFields } from "@/lib/validation/vehicle";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";
import type { Vehicle } from "@/db/schema";

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

export function VehicleEditForm({ vehicle }: { vehicle: Vehicle }) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(updateVehicleAction, validateVehicleUpdateFields);

  return (
    <Card
      as="form"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      padding="md"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="vehicleId" value={vehicle.id} />

      <TextField
        label="Nombre"
        name="name"
        defaultValue={vehicle.name}
        error={fieldErrors?.name}
      />

      <SelectField
        label="Tipo de vehículo"
        name="type"
        defaultValue={vehicle.type}
        error={fieldErrors?.type}
      >
        {VEHICLE_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Unidad de medida"
        name="metricUnit"
        defaultValue={vehicle.metricUnit}
        error={fieldErrors?.metricUnit}
      >
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
        defaultValue={vehicle.currentValue}
        error={fieldErrors?.currentValue}
      />

      <TextField
        label="Uso semanal estimado (opcional)"
        name="usageRatePerWeek"
        type="number"
        step="any"
        min={0}
        defaultValue={vehicle.usageRatePerWeek ?? ""}
        error={fieldErrors?.usageRatePerWeek}
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
