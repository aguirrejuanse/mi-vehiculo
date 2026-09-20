import { describe, expect, it } from "vitest";
import { nextPartStatus, partSchema, type PartStatus } from "@/lib/validation/part";

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

describe("nextPartStatus", () => {
  it("advances wishlist to pendiente_instalar", () => {
    expect(nextPartStatus("wishlist")).toBe("pendiente_instalar");
  });

  it("advances pendiente_instalar to instalado", () => {
    expect(nextPartStatus("pendiente_instalar")).toBe("instalado");
  });

  it("has no next status once instalado (terminal)", () => {
    expect(nextPartStatus("instalado")).toBeNull();
  });

  it("covers every PartStatus literal — no status left without a map entry", () => {
    const allStatuses: PartStatus[] = [
      "wishlist",
      "pendiente_instalar",
      "instalado",
    ];

    for (const status of allStatuses) {
      expect(() => nextPartStatus(status)).not.toThrow();
    }

    // Exhaustiveness at the type level: if PartStatus grows a new member,
    // this assignment fails to compile until PART_STATUS_TRANSITIONS (and
    // this list) is updated.
    const _exhaustive: Record<PartStatus, true> = {
      wishlist: true,
      pendiente_instalar: true,
      instalado: true,
    };
    expect(Object.keys(_exhaustive)).toHaveLength(allStatuses.length);
  });
});
