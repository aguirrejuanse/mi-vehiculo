import { z } from "zod";
import { emptyToUndefined } from "@/lib/validation/action-state";

export const maintenanceTypeSchema = z.object({
  vehicleId: z.uuid({ error: "Vehículo inválido." }),
  name: z
    .string({ error: "Ponele un nombre al mantenimiento." })
    .trim()
    .min(1, { error: "Ponele un nombre al mantenimiento." })
    .max(80, { error: "Máximo 80 caracteres." }),
  intervalValue: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: "Ingresá el intervalo." })
      .refine((value) => !Number.isNaN(Number(value)), {
        error: "Tiene que ser un número.",
      })
      .refine((value) => Number(value) > 0, {
        error: "Tiene que ser mayor a 0.",
      }),
  ),
});

export type MaintenanceTypeInput = z.infer<typeof maintenanceTypeSchema>;

export function validateMaintenanceTypeFields(formData: FormData) {
  const parsed = maintenanceTypeSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    intervalValue: formData.get("intervalValue"),
  });

  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof MaintenanceTypeInput, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (
      typeof key === "string" &&
      !fieldErrors[key as keyof MaintenanceTypeInput]
    ) {
      fieldErrors[key as keyof MaintenanceTypeInput] = issue.message;
    }
  }
  return fieldErrors;
}
