import { describe, expect, it } from "vitest";
import { getSuggestedMaintenances } from "@/lib/maintenance/templates";
import { isDecimalString } from "@/lib/validation/numeric";
import {
  ENGINE_OPTIONS_BY_TYPE,
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
  // Every engine value (plus null for "unknown"/N/A) is exercised against
  // every combo so a misplaced `engines` tag surfaces instead of silently
  // never matching.
  const ALL_ENGINES: (string | null)[] = [null, "2t", "4t", "nafta", "diesel"];
  const all = VEHICLE_TYPES.flatMap((type) =>
    [
      ...SUBTYPES_BY_TYPE[type].map((subtype) => [type, subtype] as const),
      [type, undefined] as const,
    ].flatMap(([, subtype]) =>
      (["horas", "km"] as const).flatMap((unit) =>
        ALL_ENGINES.map((engine) => ({ type, subtype, unit, engine })),
      ),
    ),
  ) as {
    type: VehicleType;
    subtype: VehicleSubtype | undefined;
    unit: "horas" | "km";
    engine: string | null;
  }[];

  it("every entry satisfies the maintenance-type interval rules", () => {
    for (const { type, subtype, unit, engine } of all) {
      const items = getSuggestedMaintenances(type, subtype, unit, engine);
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
        // An engines-tagged row only ever returns when the vehicle's engine
        // is in its list — and a tag must name an engine the type allows.
        if (item.engines != null) {
          expect(
            item.engines,
            `${item.key}: returned for a non-matching engine`,
          ).toContain(engine);
          for (const tag of item.engines) {
            expect(
              ENGINE_OPTIONS_BY_TYPE[type] as readonly string[],
              `${item.key}: "${tag}" is not a ${type} engine`,
            ).toContain(tag);
          }
        }
      }
    }
  });

  it("keys are unique within each set", () => {
    for (const { type, subtype, unit, engine } of all) {
      const keys = getSuggestedMaintenances(type, subtype, unit, engine).map(
        (item) => item.key,
      );
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("drops usage intervals when the vehicle is tracked in the other unit", () => {
    const horasSet = getSuggestedMaintenances(
      "moto",
      "moto_enduro",
      "horas",
      "2t",
    );
    const kmSet = getSuggestedMaintenances(
      "moto",
      "moto_enduro",
      "km",
      "2t",
    );

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
      // A representative engine for the type so engine-tagged rows stay in
      // the comparison (null would drop them from both sides).
      const engine =
        (ENGINE_OPTIONS_BY_TYPE[type as VehicleType] as readonly string[])[0] ??
        null;
      for (const subtype of subtypes) {
        const defaultUnit = METRIC_UNIT_BY_SUBTYPE[subtype];
        const otherUnit = defaultUnit === "horas" ? "km" : "horas";
        const withDefault = getSuggestedMaintenances(
          type as VehicleType,
          subtype,
          defaultUnit,
          engine,
        );
        const withOther = getSuggestedMaintenances(
          type as VehicleType,
          subtype,
          otherUnit,
          engine,
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
    expect(getSuggestedMaintenances("moto", undefined, "horas", null)).toEqual(
      [],
    );
    // Subtype lookup wins over type — schema validation guarantees valid
    // pairs, but a corrupt "auto + bici_ruta" row resolves to bici_ruta's
    // set rather than [].
    expect(getSuggestedMaintenances("auto", "bici_ruta", "km", null)).toEqual(
      getSuggestedMaintenances("bicicleta", "bici_ruta", "km", null),
    );
  });

  it("filters engine-tagged rows by the vehicle's engine", () => {
    const keys2t = getSuggestedMaintenances(
      "moto",
      "moto_enduro",
      "horas",
      "2t",
    ).map((item) => item.key);
    const keys4t = getSuggestedMaintenances(
      "moto",
      "moto_enduro",
      "horas",
      "4t",
    ).map((item) => item.key);

    expect(keys2t).toContain("aceite-caja-2t");
    expect(keys2t).toContain("piston-2t");
    expect(keys2t).not.toContain("aceite-motor-4t");
    expect(keys2t).not.toContain("piston-4t");

    expect(keys4t).toContain("aceite-motor-4t");
    expect(keys4t).toContain("piston-4t");
    expect(keys4t).not.toContain("aceite-caja-2t");
    expect(keys4t).not.toContain("piston-2t");

    // Engine-agnostic rows apply either way.
    expect(keys2t).toContain("filtro-aire");
    expect(keys4t).toContain("filtro-aire");
  });

  it("drops every engines-tagged row when the engine is unknown", () => {
    const items = getSuggestedMaintenances(
      "moto",
      "moto_enduro",
      "horas",
      null,
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.engines == null)).toBe(true);
  });

  it("sets without engines-tagged rows ignore the engine param", () => {
    for (const [type, subtype, unit] of [
      ["auto", undefined, "km"],
      ["bicicleta", "bici_ruta", "km"],
      ["moto", "moto_calle", "km"],
    ] as const) {
      expect(
        getSuggestedMaintenances(type, subtype, unit, null),
      ).toEqual(getSuggestedMaintenances(type, subtype, unit, "4t"));
    }
  });
});
