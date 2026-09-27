import { describe, expect, it } from "vitest";
import {
  ENGINE_OPTIONS_BY_TYPE,
  vehicleSchema,
  vehicleUpdateSchema,
} from "@/lib/validation/vehicle";

const BASE = {
  name: "Test",
  type: "moto",
  subtype: "moto_enduro",
  metricUnit: "horas",
  currentValue: "0",
};

describe("vehicleSchema engine/displacementCc", () => {
  it("accepts an engine from the type's option set", () => {
    for (const engine of ENGINE_OPTIONS_BY_TYPE.moto) {
      const parsed = vehicleSchema.safeParse({ ...BASE, engine });
      expect(parsed.success, engine).toBe(true);
      expect(parsed.success && parsed.data.engine).toBe(engine);
    }
  });

  it("engine is optional (empty stays null-ish)", () => {
    const parsed = vehicleSchema.safeParse({ ...BASE, engine: "" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.engine).toBeUndefined();
  });

  it("maps the wizard's explicit 'No sé' sentinel to null-ish", () => {
    const parsed = vehicleSchema.safeParse({ ...BASE, engine: "unknown" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.engine).toBeUndefined();
  });

  it("rejects an engine from another type's set", () => {
    const parsed = vehicleSchema.safeParse({ ...BASE, engine: "nafta" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.path[0] === "engine"),
      ).toBe(true);
    }
  });

  it("rejects any engine for types without an engine taxonomy", () => {
    const parsed = vehicleSchema.safeParse({
      ...BASE,
      type: "bicicleta",
      subtype: "bici_ruta",
      metricUnit: "km",
      engine: "2t",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a positive integer displacementCc for moto/auto", () => {
    const moto = vehicleSchema.safeParse({ ...BASE, displacementCc: "300" });
    expect(moto.success).toBe(true);
    const auto = vehicleSchema.safeParse({
      ...BASE,
      type: "auto",
      subtype: undefined,
      metricUnit: "km",
      displacementCc: "1600",
    });
    expect(auto.success).toBe(true);
  });

  it.each(["0", "-50", "125.5", "abc", "0x10", "Infinity"])(
    "rejects invalid displacementCc %s",
    (displacementCc) => {
      const parsed = vehicleSchema.safeParse({ ...BASE, displacementCc });
      expect(parsed.success).toBe(false);
    },
  );

  it("rejects displacementCc for types without an engine taxonomy", () => {
    const parsed = vehicleSchema.safeParse({
      ...BASE,
      type: "monopatin",
      subtype: undefined,
      metricUnit: "km",
      displacementCc: "250",
    });
    expect(parsed.success).toBe(false);
  });

  it("update schema cannot write engine/displacementCc (identity lock)", () => {
    const parsed = vehicleUpdateSchema.safeParse({
      vehicleId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      name: "Test",
      metricUnit: "km",
      currentValue: "10",
      engine: "4t",
      displacementCc: "999",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && "engine" in parsed.data).toBe(false);
    expect(parsed.success && "displacementCc" in parsed.data).toBe(false);
  });
});
