"use client";

import { createPartAction } from "@/app/dashboard/vehiculos/[vehicleId]/repuestos/nuevo/actions";
import { validatePartFields } from "@/lib/validation/part";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

export function PartForm({
  vehicleId,
  maintenanceTypes,
  maintenanceLogs,
}: {
  vehicleId: string;
  maintenanceTypes: { id: string; name: string }[];
  maintenanceLogs: { id: string; label: string }[];
}) {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(createPartAction, validatePartFields);

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
        placeholder="Cadena, pastillas de freno..."
        error={fieldErrors?.name}
      />

      <SelectField
        label="Para (opcional, mantenimiento)"
        name="maintenanceTypeId"
        defaultValue=""
        error={fieldErrors?.maintenanceTypeId}
      >
        <option value="">Sin vincular</option>
        {maintenanceTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="De (opcional, nota sobre un registro ya cargado)"
        name="maintenanceLogId"
        defaultValue=""
        error={fieldErrors?.maintenanceLogId}
      >
        <option value="">Sin vincular</option>
        {maintenanceLogs.map((log) => (
          <option key={log.id} value={log.id}>
            {log.label}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Notas (opcional)"
        name="notes"
        placeholder="Marca, proveedor, precio..."
        error={fieldErrors?.notes}
      />

      <FieldError message={state.status === "error" ? state.message : undefined} />

      <SubmitButton
        isPending={isPending}
        label="Guardar repuesto"
        pendingLabel="Guardando..."
      />
    </Card>
  );
}
