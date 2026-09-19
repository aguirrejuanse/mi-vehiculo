import { z } from "zod";
import {
  emptyToUndefined,
  fieldErrorsFromZodError,
} from "@/lib/validation/action-state";

export const maintenanceLogSchema = z.object({
  vehicleId: z.uuid({ error: "Vehículo inválido." }),
  maintenanceTypeId: z.uuid({ error: "Elegí qué mantenimiento hiciste." }),
  performedAtValue: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: "Ingresá el valor del odómetro." })
      .refine((value) => !Number.isNaN(Number(value)), {
        error: "Tiene que ser un número.",
      })
      .refine((value) => Number(value) >= 0, {
        error: "No puede ser negativo.",
      }),
  ),
  performedAtDate: z
    .string({ error: "Elegí una fecha." })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      error: "Fecha inválida.",
    }),
  notes: z.preprocess(
    emptyToUndefined,
    z.string().max(500, { error: "Máximo 500 caracteres." }).optional(),
  ),
});

export type MaintenanceLogInput = z.infer<typeof maintenanceLogSchema>;

export function validateMaintenanceLogFields(formData: FormData) {
  const parsed = maintenanceLogSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    maintenanceTypeId: formData.get("maintenanceTypeId"),
    performedAtValue: formData.get("performedAtValue"),
    performedAtDate: formData.get("performedAtDate"),
    notes: formData.get("notes"),
  });

  if (parsed.success) return null;

  return fieldErrorsFromZodError<MaintenanceLogInput>(parsed.error);
}

export const maintenanceLogUpdateSchema = z.object({
  logId: z.uuid({ error: "Registro inválido." }),
  vehicleId: z.uuid({ error: "Vehículo inválido." }),
  performedAtValue: maintenanceLogSchema.shape.performedAtValue,
  performedAtDate: maintenanceLogSchema.shape.performedAtDate,
  notes: maintenanceLogSchema.shape.notes,
});

export type MaintenanceLogUpdateInput = z.infer<
  typeof maintenanceLogUpdateSchema
>;

export function validateMaintenanceLogUpdateFields(formData: FormData) {
  const parsed = maintenanceLogUpdateSchema.safeParse({
    logId: formData.get("logId"),
    vehicleId: formData.get("vehicleId"),
    performedAtValue: formData.get("performedAtValue"),
    performedAtDate: formData.get("performedAtDate"),
    notes: formData.get("notes"),
  });

  if (parsed.success) return null;

  return fieldErrorsFromZodError<MaintenanceLogUpdateInput>(parsed.error);
}
