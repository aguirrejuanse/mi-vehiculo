import { describe, expect, it } from "vitest";
import { partSchema } from "@/lib/validation/part";

const VEHICLE_ID = "123e4567-e89b-12d3-a456-426614174000";
const TYPE_ID = "223e4567-e89b-12d3-a456-426614174000";
const LOG_ID = "323e4567-e89b-12d3-a456-426614174000";

describe("partSchema", () => {
  it("passes with neither link set", () => {
    const result = partSchema.safeParse({
      vehicleId: VEHICLE_ID,
      name: "Cadena",
    });

    expect(result.success).toBe(true);
  });

  it("passes with only maintenanceTypeId set", () => {
    const result = partSchema.safeParse({
      vehicleId: VEHICLE_ID,
      name: "Pistón",
      maintenanceTypeId: TYPE_ID,
    });

    expect(result.success).toBe(true);
  });

  it("passes with only maintenanceLogId set", () => {
    const result = partSchema.safeParse({
      vehicleId: VEHICLE_ID,
      name: "Pastillas de freno",
      maintenanceLogId: LOG_ID,
    });

    expect(result.success).toBe(true);
  });

  it("fails when both links are set, reporting the error on both paths", () => {
    const result = partSchema.safeParse({
      vehicleId: VEHICLE_ID,
      name: "Cadena",
      maintenanceTypeId: TYPE_ID,
      maintenanceLogId: LOG_ID,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const paths = result.error.issues.map((issue) => issue.path[0]);
    expect(paths).toContain("maintenanceTypeId");
    expect(paths).toContain("maintenanceLogId");
  });

  it("fails when the name is empty", () => {
    const result = partSchema.safeParse({
      vehicleId: VEHICLE_ID,
      name: "",
    });

    expect(result.success).toBe(false);
  });
});
