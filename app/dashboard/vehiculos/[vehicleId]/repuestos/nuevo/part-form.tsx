"use client";

import { createPartAction } from "@/app/dashboard/vehiculos/[vehicleId]/repuestos/nuevo/actions";
import { validatePartFields } from "@/lib/validation/part";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { TextField } from "@/components/ui/text-field";
import { ComboboxField } from "@/components/ui/combobox-field";
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

      <ComboboxField
        label="Para (opcional, mantenimiento)"
        name="maintenanceTypeId"
        placeholder="Sin vincular"
        options={[
          { value: "", label: "Sin vincular" },
          ...maintenanceTypes.map((type) => ({
            value: type.id,
            label: type.name,
          })),
        ]}
        error={fieldErrors?.maintenanceTypeId}
      />

      <ComboboxField
        label="De (opcional, nota sobre un registro ya cargado)"
        name="maintenanceLogId"
        placeholder="Sin vincular"
        options={[
          { value: "", label: "Sin vincular" },
          ...maintenanceLogs.map((log) => ({
            value: log.id,
            label: log.label,
          })),
        ]}
        error={fieldErrors?.maintenanceLogId}
      />

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
