"use client";

import { useState } from "react";
import { createVehicleAction } from "@/app/dashboard/vehiculos/nuevo/actions";
import {
  validateVehicleFields,
  SUBTYPES_BY_TYPE,
  SUBTYPE_LABELS,
  METRIC_UNIT_BY_SUBTYPE,
  type VehicleType,
  type VehicleSubtype,
} from "@/lib/validation/vehicle";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

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

// Interim flat-form subtype selector for slice 1. Replaced by the
// multi-step wizard in slice 2 (see design ADR #4/#12) — not the final UX,
// but required so create still works while subtype is mandatory for
// moto/bicicleta.
export function VehicleForm() {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(createVehicleAction, validateVehicleFields);
  const [type, setType] = useState<VehicleType | "">("");
  const [metricUnit, setMetricUnit] = useState<"horas" | "km" | "">("");
  const subtypeOptions = type ? SUBTYPES_BY_TYPE[type] : [];

  return (
    <Card
      as="form"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      padding="md"
      className="flex flex-col gap-5"
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
        value={type}
        onChange={(event) => setType(event.target.value as VehicleType)}
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

      {subtypeOptions.length > 0 && (
        <SelectField
          label="Subtipo"
          name="subtype"
          defaultValue=""
          error={fieldErrors?.subtype}
          onChange={(event) => {
            const subtype = event.target.value as VehicleSubtype;
            setMetricUnit(METRIC_UNIT_BY_SUBTYPE[subtype]);
          }}
        >
          <option value="" disabled>
            Elegí un subtipo
          </option>
          {subtypeOptions.map((option) => (
            <option key={option} value={option}>
              {SUBTYPE_LABELS[option]}
            </option>
          ))}
        </SelectField>
      )}

      <SelectField
        label="Unidad de medida"
        name="metricUnit"
        value={metricUnit}
        onChange={(event) =>
          setMetricUnit(event.target.value as "horas" | "km")
        }
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
    </Card>
  );
}
