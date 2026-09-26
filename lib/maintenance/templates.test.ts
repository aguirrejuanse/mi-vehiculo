import { describe, expect, it } from "vitest";
import { getSuggestedMaintenances } from "@/lib/maintenance/templates";
import { isDecimalString } from "@/lib/validation/numeric";
import {
  METRIC_UNIT_BY_SUBTYPE,
  SUBTYPES_BY_TYPE,
  VEHICLE_TYPES,
  type VehicleSubtype,
  type VehicleType,
} from "@/lib/validation/vehicle";

// Invariants the catalog must hold because rows are inserted verbatim as
// maintenance_types (see maintenance-type.ts): positive decimal-string
// usage intervals, calendar value+unit both set or both absent, unique keys.
describe("getSuggestedMaintenances catalog invariants", () => {
  const all = VEHICLE_TYPES.flatMap((type) =>
    [
      ...SUBTYPES_BY_TYPE[type].map((subtype) => [type, subtype] as const),
      [type, undefined] as const,
    ].flatMap(([, subtype]) =>
      (["horas", "km"] as const).map((unit) => ({ type, subtype, unit })),
    ),
  ) as {
    type: VehicleType;
    subtype: VehicleSubtype | undefined;
    unit: "horas" | "km";
  }[];

  it("every entry satisfies the maintenance-type interval rules", () => {
    for (const { type, subtype, unit } of all) {
      const items = getSuggestedMaintenances(type, subtype, unit);
      for (const item of items) {
        if (item.intervalValue != null) {
          expect(
            isDecimalString(item.intervalValue),
            `${item.key}: intervalValue`,
          ).toBe(true);
          expect(
            Number(item.intervalValue),
            `${item.key}: positive`,
          ).toBeGreaterThan(0);
        }
        expect(
          item.intervalCalendarValue != null,
          `${item.key}: calendar value without unit`,
        ).toBe(item.intervalCalendarUnit != null);
        if (item.intervalCalendarValue != null) {
          expect(
            Number.isInteger(item.intervalCalendarValue) &&
              item.intervalCalendarValue > 0,
            `${item.key}: calendar value`,
          ).toBe(true);
        }
      }
    }
  });

  it("keys are unique within each set", () => {
    for (const { type, subtype, unit } of all) {
      const keys = getSuggestedMaintenances(type, subtype, unit).map(
        (item) => item.key,
      );
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("drops usage intervals when the vehicle is tracked in the other unit", () => {
    const horasSet = getSuggestedMaintenances("moto", "moto_enduro", "horas");
    const kmSet = getSuggestedMaintenances("moto", "moto_enduro", "km");

    expect(horasSet.some((item) => item.intervalValue != null)).toBe(true);
    expect(kmSet.every((item) => item.intervalValue == null)).toBe(true);
    // Calendar and interval-less rows still apply regardless of unit.
    expect(kmSet.length).toBeGreaterThan(0);
  });

  it("each catalog set's authored unit matches the subtype default", () => {
    // The full set comes back only when the vehicle's metricUnit equals the
    // set's declared `unit` — so the call with METRIC_UNIT_BY_SUBTYPE[s]
    // must return at least as many items as the call with the other unit.
    // A mislabeled `unit` would silently drop usage rows for the vehicles
    // the catalog was written for.
    for (const [type, subtypes] of Object.entries(SUBTYPES_BY_TYPE)) {
      for (const subtype of subtypes) {
        const defaultUnit = METRIC_UNIT_BY_SUBTYPE[subtype];
        const otherUnit = defaultUnit === "horas" ? "km" : "horas";
        const withDefault = getSuggestedMaintenances(
          type as VehicleType,
          subtype,
          defaultUnit,
        );
        const withOther = getSuggestedMaintenances(
          type as VehicleType,
          subtype,
          otherUnit,
        );
        if (withDefault.length === 0 && withOther.length === 0) continue;
        expect(
          withDefault.length,
          `${subtype}: default unit should return the fuller set`,
        ).toBeGreaterThanOrEqual(withOther.length);
        // Mismatch never empties a covered set — calendar/no-interval rows
        // always remain.
        expect(
          withOther.length,
          `${subtype}: mismatched unit left nothing`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("returns [] for uncovered type/subtype combos", () => {
    // moto has no type-level set — only subtypes.
    expect(getSuggestedMaintenances("moto", undefined, "horas")).toEqual([]);
    // Subtype lookup wins over type — schema validation guarantees valid
    // pairs, but a corrupt "auto + bici_ruta" row resolves to bici_ruta's
    // set rather than [].
    expect(getSuggestedMaintenances("auto", "bici_ruta", "km")).toEqual(
      getSuggestedMaintenances("bicicleta", "bici_ruta", "km"),
    );
  });
});
