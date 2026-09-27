import { z } from "zod";
import {
  emptyToUndefined,
  fieldErrorsFromZodError,
} from "@/lib/validation/action-state";
import { isDecimalString } from "@/lib/validation/numeric";

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

// Parses the `?tipo=` search param into a VehicleType; invalid/absent values
// fall back to undefined so the wizard starts empty instead of breaking.
export function parseVehicleTypeParam(
  value: string | string[] | undefined,
): VehicleType | undefined {
  if (typeof value !== "string") return undefined;
  return VEHICLE_TYPES.includes(value as VehicleType)
    ? (value as VehicleType)
    : undefined;
}

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

// Engine taxonomy is per-`type`, like SUBTYPES_BY_TYPE: "2t"/"4t" for moto,
// "nafta"/"diesel" for auto; bicicleta/monopatin have no engine at all (any
// submitted value is rejected by vehicleSchema). Empty string means "No sé"
// and is normalized to null before this runs (emptyToUndefined).
export const ENGINE_OPTIONS_BY_TYPE = {
  moto: ["2t", "4t"],
  auto: ["nafta", "diesel"],
  bicicleta: [],
  monopatin: [],
} as const;

export type VehicleEngine =
  (typeof ENGINE_OPTIONS_BY_TYPE)[VehicleType][number];

export const ENGINE_LABELS: Record<VehicleEngine, string> = {
  "2t": "2 tiempos",
  "4t": "4 tiempos",
  nafta: "Nafta",
  diesel: "Diésel",
};

const ALL_ENGINES = Object.values(ENGINE_OPTIONS_BY_TYPE).flat() as [
  VehicleEngine,
  ...VehicleEngine[],
];

const numericString = z.preprocess(
  emptyToUndefined,
  z
    .string({ error: "Ingresá un valor." })
    .refine(isDecimalString, {
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
  // Optional even for moto/auto — the wizard's explicit "No sé" submits
  // "unknown". Which values are valid for which type is cross-checked in
  // vehicleSchema.superRefine (needs `type`, so it can't live here).
  engine: z.preprocess(
    (value) => emptyToUndefined(value === "unknown" ? null : value),
    z.enum(ALL_ENGINES, { error: "Elegí un motor válido." }).nullish(),
  ),
  // Optional cc (moto/auto only — the type check is in superRefine too).
  displacementCc: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(isDecimalString, {
        error: "Tiene que ser un número.",
      })
      .refine((value) => Number.isInteger(Number(value)), {
        error: "Tiene que ser un número entero.",
      })
      .refine((value) => Number(value) > 0, {
        error: "Tiene que ser mayor a 0.",
      })
      // 20.000 cc is already absurd (heavy trucks run ~16L) — the bound's
      // real job is staying under Postgres integer max so a fat-fingered
      // value fails validation instead of erroring the insert.
      .refine((value) => Number(value) <= 20_000, {
        error: "Máximo 20.000 cc.",
      })
      .optional(),
  ),
  metricUnit: z.enum(["horas", "km"], {
    error: "Elegí una unidad de medida.",
  }),
  currentValue: numericString,
  usageRatePerWeek: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(isDecimalString, {
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
  } else if (data.subtype == null) {
    ctx.addIssue({
      code: "custom",
      path: ["subtype"],
      message: "Elegí un subtipo.",
    });
  } else if (!validSubtypes.includes(data.subtype)) {
    ctx.addIssue({
      code: "custom",
      path: ["subtype"],
      message: "Ese subtipo no corresponde a este tipo de vehículo.",
    });
  }

  const validEngines: readonly string[] = ENGINE_OPTIONS_BY_TYPE[data.type];
  if (data.engine != null) {
    if (validEngines.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["engine"],
        message: "Este tipo de vehículo no tiene motor.",
      });
    } else if (!validEngines.includes(data.engine)) {
      ctx.addIssue({
        code: "custom",
        path: ["engine"],
        message: "Ese motor no corresponde a este tipo de vehículo.",
      });
    }
  }

  // Cilindrada only applies to the engine-having types (moto/auto).
  if (data.displacementCc != null && validEngines.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["displacementCc"],
      message: "Este tipo de vehículo no lleva cilindrada.",
    });
  }
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export function validateVehicleFields(formData: FormData) {
  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    subtype: formData.get("subtype"),
    engine: formData.get("engine"),
    displacementCc: formData.get("displacementCc"),
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
// them off `parsed.data`. `engine`/`displacementCc` are omitted for the
// same reason: their validity depends on `type` (dropped above), and the
// catalog treats them as creation-time identity, not editable state. See
// design ADR #3.
export const vehicleUpdateSchema = vehicleBaseSchema
  .omit({ type: true, subtype: true, engine: true, displacementCc: true })
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
