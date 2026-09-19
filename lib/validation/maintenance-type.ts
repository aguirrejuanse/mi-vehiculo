import { z } from "zod";
import { emptyToUndefined } from "@/lib/validation/action-state";

// Plain object schema — NOT refined. `maintenanceTypeSchema` adds the
// cross-field interval check via `.superRefine()` below. Do not re-merge
// these into one refined chain: a `ZodEffects` loses `.shape`/`.omit()`,
// same ADR as `lib/validation/vehicle.ts:49-54`.
export const maintenanceTypeBaseSchema = z.object({
  vehicleId: z.uuid({ error: "Vehículo inválido." }),
  name: z
    .string({ error: "Ponele un nombre al mantenimiento." })
    .trim()
    .min(1, { error: "Ponele un nombre al mantenimiento." })
    .max(80, { error: "Máximo 80 caracteres." }),
  intervalValue: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => !Number.isNaN(Number(value)), {
        error: "Tiene que ser un número.",
      })
      .refine((value) => Number(value) > 0, {
        error: "Tiene que ser mayor a 0.",
      })
      .optional(),
  ),
  intervalCalendarValue: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Tiene que ser un número." })
      .int({ error: "Tiene que ser un número entero." })
      .positive({ error: "Tiene que ser mayor a 0." })
      .optional(),
  ),
  intervalCalendarUnit: z.preprocess(
    emptyToUndefined,
    z
      .enum(["dias", "meses"], { error: "Elegí una unidad válida." })
      .optional(),
  ),
  // Confirmation that the user explicitly opted out of an interval. Not
  // persisted: "no interval" is already representable as both interval
  // fields being null. An HTML checkbox sends "on" when checked or is
  // simply absent from the FormData when unchecked, hence the preprocess.
  noInterval: z.preprocess(
    (value) => value === "on" || value === true,
    z.boolean(),
  ),
});

// Gotcha: `fieldErrorsFromZodError` (lib/validation/action-state.ts:16)
// silently drops any issue whose `path[0]` is not a string. Every issue
// added here MUST carry an explicit `path`, including the "at least one
// interval" case, which is reported on BOTH interval fields so it surfaces
// next to whichever field the user is looking at.
export const maintenanceTypeSchema = maintenanceTypeBaseSchema.superRefine(
  (data, ctx) => {
    const sinIntervalos =
      data.intervalValue == null && data.intervalCalendarValue == null;

    if (data.noInterval && !sinIntervalos) {
      ctx.addIssue({
        code: "custom",
        path: ["noInterval"],
        message:
          'Destildá "sin intervalo" o borrá los intervalos cargados.',
      });
      return;
    }

    if (!data.noInterval && sinIntervalos) {
      const message =
        'Definí un intervalo por uso y/o por calendario, o tildá "sin intervalo".';
      ctx.addIssue({
        code: "custom",
        path: ["intervalValue"],
        message,
      });
      ctx.addIssue({
        code: "custom",
        path: ["intervalCalendarValue"],
        message,
      });
      ctx.addIssue({
        code: "custom",
        path: ["noInterval"],
        message,
      });
      return;
    }

    if (
      data.intervalCalendarValue != null &&
      data.intervalCalendarUnit == null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalCalendarUnit"],
        message: "Elegí la unidad del intervalo por calendario.",
      });
    }

    if (
      data.intervalCalendarUnit != null &&
      data.intervalCalendarValue == null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalCalendarValue"],
        message: "Ingresá el valor del intervalo por calendario.",
      });
    }
  },
);

export type MaintenanceTypeInput = z.infer<typeof maintenanceTypeSchema>;

export function validateMaintenanceTypeFields(formData: FormData) {
  const parsed = maintenanceTypeSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    intervalValue: formData.get("intervalValue"),
    intervalCalendarValue: formData.get("intervalCalendarValue"),
    intervalCalendarUnit: formData.get("intervalCalendarUnit"),
    noInterval: formData.get("noInterval"),
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
