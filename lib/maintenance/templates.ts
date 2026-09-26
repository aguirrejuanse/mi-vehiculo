import type {
  VehicleSubtype,
  VehicleType,
} from "@/lib/validation/vehicle";

// A row of the suggested-maintenance catalog shown on the post-creation
// "listo" screen: name + suggested interval + an optional note carrying the
// context a single number can't ("Cada 10-15 h según uso").
// `intervalValue` is a string because maintenance_types.intervalValue is a
// numeric column and numerics round-trip as strings — template values are
// inserted verbatim. `key` is the stable identifier the client submits;
// intervals never travel from client to server.
export type SuggestedMaintenance = {
  key: string;
  name: string;
  intervalValue?: string;
  intervalCalendarValue?: number;
  intervalCalendarUnit?: "dias" | "meses";
  note?: string;
};

// moto_enduro is the deep set — intervals are in HORAS (the subtype's
// metric unit). Usage and calendar intervals are independent: a row can
// carry either, both, or neither ("Lavado general" is deliberately
// interval-less).
const MOTO_ENDURO: SuggestedMaintenance[] = [
  {
    key: "aceite-caja-2t",
    name: "Aceite de caja (2T)",
    intervalValue: "12",
    note: "Cada 10-15 h según uso",
  },
  {
    key: "aceite-motor-4t",
    name: "Aceite de motor (4T)",
    intervalValue: "10",
  },
  { key: "filtro-aire", name: "Filtro de aire", intervalValue: "20" },
  {
    key: "aceite-horquilla",
    name: "Aceite de horquilla delantera",
    intervalValue: "30",
  },
  {
    key: "monoshock",
    name: "Service de monoshock trasero",
    intervalValue: "40",
  },
  {
    key: "engrase",
    name: "Engrase completo (linkages, caja de dirección)",
    intervalValue: "45",
    note: "Cada 40-50 h",
  },
  {
    key: "piston-2t-chico",
    name: "Pistón (2T 85-125 cc)",
    intervalValue: "30",
    note: "250 cc 2T: ~40 h",
  },
  {
    key: "piston-4t",
    name: "Pistón + reglaje de válvulas (4T)",
    intervalValue: "100",
  },
  {
    key: "kit-transmision",
    name: "Kit de transmisión",
    intervalValue: "50",
  },
  {
    key: "liquido-frenos",
    name: "Líquido de frenos",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  },
  {
    key: "refrigerante",
    name: "Líquido refrigerante",
    intervalCalendarValue: 24,
    intervalCalendarUnit: "meses",
  },
  { key: "lavado", name: "Lavado general" },
];

// moto_calle is measured in km (METRIC_UNIT_BY_SUBTYPE), so intervalValue
// means kilometres here — the same column, a different unit.
const MOTO_CALLE: SuggestedMaintenance[] = [
  { key: "aceite", name: "Cambio de aceite", intervalValue: "5000" },
  {
    key: "frenos",
    name: "Revisión de frenos",
    intervalCalendarValue: 6,
    intervalCalendarUnit: "meses",
  },
  {
    key: "transmision",
    name: "Transmisión/cadena",
    intervalValue: "1000",
  },
  {
    key: "cubiertas",
    name: "Cambio de cubiertas",
    note: "según desgaste",
  },
];

const AUTO: SuggestedMaintenance[] = [
  {
    key: "service",
    name: "Service completo (aceite + filtros)",
    intervalValue: "10000",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  },
  {
    key: "distribucion",
    name: "Distribución",
    intervalValue: "60000",
    note: "revisar manual",
  },
  {
    key: "vtv",
    name: "VTV",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  },
];

// Shared by bici_enduro and bici_downhill — both are horas-based MTB
// subtypes with the same maintenance cadence.
const BICI_ENDURO: SuggestedMaintenance[] = [
  { key: "horquilla", name: "Service de horquilla", intervalValue: "50" },
  {
    key: "amortiguador",
    name: "Service de amortiguador (aire)",
    intervalValue: "50",
    note: "completo: 200 h",
  },
  {
    key: "tubeless",
    name: "Líquido tubeless",
    intervalCalendarValue: 3,
    intervalCalendarUnit: "meses",
  },
  {
    key: "purgado-frenos",
    name: "Purgado de frenos",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  },
  {
    key: "tornilleria",
    name: "Tornillería",
    intervalCalendarValue: 1,
    intervalCalendarUnit: "meses",
  },
];

const BICI_RUTA: SuggestedMaintenance[] = [
  {
    key: "lubricar-transmision",
    name: "Limpiar y lubricar transmisión",
    intervalValue: "300",
  },
  {
    key: "frenos-pastillas",
    name: "Revisión de frenos y pastillas",
    intervalCalendarValue: 3,
    intervalCalendarUnit: "meses",
  },
  {
    key: "cadena",
    name: "Cambio de cadena",
    intervalValue: "3000",
    note: "o al 0,5 % de desgaste",
  },
  {
    key: "tornilleria",
    name: "Tornillería general",
    intervalCalendarValue: 1,
    intervalCalendarUnit: "meses",
  },
];

// The eléctrica shares the ruta set plus its battery-specific item.
const BICI_ELECTRICA: SuggestedMaintenance[] = [
  ...BICI_RUTA,
  {
    key: "bateria-guardada",
    name: "Carga de batería guardada",
    intervalCalendarValue: 3,
    intervalCalendarUnit: "meses",
  },
];

const MONOPATIN: SuggestedMaintenance[] = [
  {
    key: "bateria",
    name: "Carga completa de batería",
    intervalCalendarValue: 30,
    intervalCalendarUnit: "dias",
  },
  {
    key: "tornilleria",
    name: "Tornillería",
    intervalCalendarValue: 30,
    intervalCalendarUnit: "dias",
  },
];

// Subtype wins over type: a moto looks up moto_calle/moto_enduro, while
// auto/monopatin (subtype-less) fall through to the type-level set.
// `unit` is the metricUnit the set's intervalValues are authored in (the
// subtype's default from METRIC_UNIT_BY_SUBTYPE): a vehicle tracked in the
// other unit only gets the calendar/no-interval rows.
const BY_SUBTYPE: Partial<
  Record<VehicleSubtype, { unit: "horas" | "km"; items: SuggestedMaintenance[] }>
> = {
  moto_calle: { unit: "km", items: MOTO_CALLE },
  moto_enduro: { unit: "horas", items: MOTO_ENDURO },
  bici_ruta: { unit: "km", items: BICI_RUTA },
  bici_enduro: { unit: "horas", items: BICI_ENDURO },
  bici_downhill: { unit: "horas", items: BICI_ENDURO },
  bici_electrica: { unit: "km", items: BICI_ELECTRICA },
};

const BY_TYPE: Partial<
  Record<VehicleType, { unit: "horas" | "km"; items: SuggestedMaintenance[] }>
> = {
  auto: { unit: "km", items: AUTO },
  monopatin: { unit: "km", items: MONOPATIN },
};

// Empty array for uncovered type/subtype combos — callers treat that as
// "skip the listo screen" rather than an error.
export function getSuggestedMaintenances(
  type: VehicleType,
  subtype: VehicleSubtype | null | undefined,
  metricUnit: "horas" | "km",
): SuggestedMaintenance[] {
  const set = (subtype ? BY_SUBTYPE[subtype] : undefined) ?? BY_TYPE[type];
  if (!set) return [];
  if (metricUnit !== set.unit) {
    return set.items.filter((item) => item.intervalValue == null);
  }
  return set.items;
}
