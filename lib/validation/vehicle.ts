import { z } from "zod";
import {
  emptyToUndefined,
  fieldErrorsFromZodError,
} from "@/lib/validation/action-state";

export const SUBTYPES_BY_TYPE = {
  moto: ["moto_calle", "moto_enduro"],
  auto: [],
  bicicleta: ["bici_ruta", "bici_enduro", "bici_downhill", "bici_electrica"],
  monopatin: [],
} as const;

export type VehicleType = keyof typeof SUBTYPES_BY_TYPE;

// Canonical display order for vehicle types (also the declared order of
// SUBTYPES_BY_TYPE keys). Used for group/chip ordering in the dashboard.
export const VEHICLE_TYPES = Object.keys(SUBTYPES_BY_TYPE) as VehicleType[];

export const TYPE_LABELS: Record<VehicleType, string> = {
  moto: "Moto",
  auto: "Auto",
  bicicleta: "Bicicleta",
  monopatin: "Monopatín",
};

// Plural labels for type groups/filters ("Autos", "Motos", ...).
export const TYPE_GROUP_LABELS: Record<VehicleType, string> = {
  moto: "Motos",
  auto: "Autos",
  bicicleta: "Bicis",
  monopatin: "Monopatines",
};
export type VehicleSubtype = (typeof SUBTYPES_BY_TYPE)[VehicleType][number];

export const SUBTYPE_LABELS: Record<VehicleSubtype, string> = {
  moto_calle: "Calle",
  moto_enduro: "Enduro/MX",
  bici_ruta: "Ruta",
  bici_enduro: "Enduro",
  bici_downhill: "Downhill",
  bici_electrica: "Eléctrica",
};

export const METRIC_UNIT_BY_SUBTYPE: Record<VehicleSubtype, "horas" | "km"> = {
  moto_calle: "km",
  moto_enduro: "horas",
  bici_ruta: "km",
  bici_enduro: "horas",
  bici_downhill: "horas",
  bici_electrica: "km",
};

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

const ALL_SUBTYPES = Object.values(SUBTYPES_BY_TYPE).flat() as [
  VehicleSubtype,
  ...VehicleSubtype[],
];

// Plain object schema — NOT refined. `vehicleSchema` (create) adds the
// cross-field subtype check via `.superRefine()` below; `vehicleUpdateSchema`
// (edit) instead `.omit()`s `type`/`subtype` so they physically cannot be
// written by the update action, enforcing the identity lock at the type
// level. Do not re-merge these into one refined chain (see design ADR #2).
export const vehicleBaseSchema = z.object({
  name: z
    .string({ error: "Ponele un nombre al vehículo." })
    .trim()
    .min(1, { error: "Ponele un nombre al vehículo." })
    .max(80, { error: "Máximo 80 caracteres." }),
  type: z.enum(["moto", "auto", "bicicleta", "monopatin"], {
    error: "Elegí un tipo de vehículo.",
  }),
  subtype: z.preprocess(
    emptyToUndefined,
    z
      .enum(ALL_SUBTYPES, { error: "Elegí un subtipo válido." })
      .nullish(),
  ),
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

export const vehicleSchema = vehicleBaseSchema.superRefine((data, ctx) => {
  const validSubtypes: readonly string[] = SUBTYPES_BY_TYPE[data.type];

  if (validSubtypes.length === 0) {
    if (data.subtype != null) {
      ctx.addIssue({
        code: "custom",
        path: ["subtype"],
        message: "Este tipo de vehículo no tiene subtipo.",
      });
    }
    return;
  }

  if (data.subtype == null) {
    ctx.addIssue({
      code: "custom",
      path: ["subtype"],
      message: "Elegí un subtipo.",
    });
    return;
  }

  if (!validSubtypes.includes(data.subtype)) {
    ctx.addIssue({
      code: "custom",
      path: ["subtype"],
      message: "Ese subtipo no corresponde a este tipo de vehículo.",
    });
  }
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export function validateVehicleFields(formData: FormData) {
  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    subtype: formData.get("subtype"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (parsed.success) return null;

  return fieldErrorsFromZodError<VehicleInput>(parsed.error);
}

// `type`/`subtype` are intentionally OMITTED here, not just left out of the
// form — this is the server-side identity lock. A crafted POST including
// those fields has nowhere to land: `updateVehicleAction` cannot even read
// them off `parsed.data`. See design ADR #3.
export const vehicleUpdateSchema = vehicleBaseSchema
  .omit({ type: true, subtype: true })
  .extend({
    vehicleId: z.uuid({ error: "Vehículo inválido." }),
  });

export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

export function validateVehicleUpdateFields(formData: FormData) {
  const parsed = vehicleUpdateSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (parsed.success) return null;

  return fieldErrorsFromZodError<VehicleUpdateInput>(parsed.error);
}
