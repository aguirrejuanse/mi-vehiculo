import { z } from "zod";
import { emptyToUndefined } from "@/lib/validation/action-state";

const numericString = z.preprocess(
  emptyToUndefined,
  z
    .string({ error: "Ingresá un valor." })
    .refine((value) => !Number.isNaN(Number(value)), {
      error: "Tiene que ser un número.",
    })
    .refine((value) => Number(value) >= 0, {
      error: "No puede ser negativo.",
    }),
);

export const vehicleSchema = z.object({
  name: z
    .string({ error: "Ponele un nombre al vehículo." })
    .trim()
    .min(1, { error: "Ponele un nombre al vehículo." })
    .max(80, { error: "Máximo 80 caracteres." }),
  type: z.enum(["moto", "auto", "bicicleta", "monopatin"], {
    error: "Elegí un tipo de vehículo.",
  }),
  metricUnit: z.enum(["horas", "km"], {
    error: "Elegí una unidad de medida.",
  }),
  currentValue: numericString,
  usageRatePerWeek: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => !Number.isNaN(Number(value)), {
        error: "Tiene que ser un número.",
      })
      .refine((value) => Number(value) >= 0, {
        error: "No puede ser negativo.",
      })
      .optional(),
  ),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export function validateVehicleFields(formData: FormData) {
  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof VehicleInput, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key as keyof VehicleInput]) {
      fieldErrors[key as keyof VehicleInput] = issue.message;
    }
  }
  return fieldErrors;
}
