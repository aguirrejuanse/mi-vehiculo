import { z } from "zod";
import {
  emptyToUndefined,
  fieldErrorsFromZodError,
} from "@/lib/validation/action-state";

// Plain object schema — NOT refined. `partSchema` adds the mutual-exclusion
// cross-field check via `.superRefine()` below. Do not re-merge these into
// one refined chain: a `ZodEffects` loses `.shape`/`.omit()`, same ADR as
// lib/validation/vehicle.ts:49-54 and lib/validation/maintenance-type.ts:4-7.
export const partBaseSchema = z.object({
  vehicleId: z.uuid({ error: "Vehículo inválido." }),
  name: z
    .string({ error: "Ponele un nombre al repuesto." })
    .trim()
    .min(1, { error: "Ponele un nombre al repuesto." })
    .max(80, { error: "Máximo 80 caracteres." }),
  // The form doesn't submit this field at all (status is derived server-side
  // in the action). `FormData.get` on a missing field returns `null`, and
  // Zod's `.default()` only kicks in on `undefined` — normalize both `null`
  // and `""` to `undefined` so the default applies.
  status: z.preprocess(
    (value) => (value == null || value === "" ? undefined : value),
    z
      .enum(["wishlist", "pendiente_instalar", "instalado"], {
        error: "Elegí un estado válido.",
      })
      .default("wishlist"),
  ),
  maintenanceTypeId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  maintenanceLogId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  notes: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

// Gotcha: `fieldErrorsFromZodError` (lib/validation/action-state.ts:16)
// silently drops any issue whose `path[0]` is not a string. Both issues
// below carry an explicit `path` so the error surfaces on whichever field
// the user is looking at, regardless of which select they touched.
export const partSchema = partBaseSchema.superRefine((data, ctx) => {
  if (data.maintenanceTypeId != null && data.maintenanceLogId != null) {
    const message =
      "Vinculá el repuesto a un mantenimiento O a un registro, no a los dos.";
    ctx.addIssue({ code: "custom", path: ["maintenanceTypeId"], message });
    ctx.addIssue({ code: "custom", path: ["maintenanceLogId"], message });
  }
});

export type PartInput = z.infer<typeof partSchema>;

export type PartStatus = PartInput["status"];

// Forward-only, one step at a time. `instalado` is terminal — no further
// transitions out of it. Keyed off the same literal union as partBaseSchema
// (`satisfies` keeps them in sync without importing the db enum here).
const PART_STATUS_TRANSITIONS = {
  wishlist: "pendiente_instalar",
  pendiente_instalar: "instalado",
  instalado: null,
} as const satisfies Record<PartStatus, PartStatus | null>;

export function nextPartStatus(current: PartStatus): PartStatus | null {
  return PART_STATUS_TRANSITIONS[current];
}

export function validatePartFields(formData: FormData) {
  const parsed = partSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    status: formData.get("status"),
    maintenanceTypeId: formData.get("maintenanceTypeId"),
    maintenanceLogId: formData.get("maintenanceLogId"),
    notes: formData.get("notes"),
  });

  if (parsed.success) return null;

  return fieldErrorsFromZodError<PartInput>(parsed.error);
}
