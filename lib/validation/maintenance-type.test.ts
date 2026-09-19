import { describe, expect, it } from "vitest";
import { validateMaintenanceTypeFields } from "@/lib/validation/maintenance-type";

const VEHICLE_ID = "123e4567-e89b-12d3-a456-426614174000";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("validateMaintenanceTypeFields", () => {
  it("passes with only a usage interval set", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cambio de aceite",
        intervalValue: "3000",
        intervalCalendarValue: "",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).toBeNull();
  });

  it("passes with only a calendar interval set (value + unit)", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Líquido de frenos",
        intervalValue: "",
        intervalCalendarValue: "12",
        intervalCalendarUnit: "meses",
      }),
    );

    expect(errors).toBeNull();
  });

  it("passes with both intervals set", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cadena",
        intervalValue: "500",
        intervalCalendarValue: "3",
        intervalCalendarUnit: "meses",
      }),
    );

    expect(errors).toBeNull();
  });

  it("fails when neither interval is set, reporting the error on both interval fields", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cubiertas",
        intervalValue: "",
        intervalCalendarValue: "",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalValue).toBeTruthy();
    expect(errors?.intervalCalendarValue).toBeTruthy();
  });

  it("fails when a calendar value is given without a unit", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cubiertas",
        intervalValue: "",
        intervalCalendarValue: "6",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalCalendarUnit).toBeTruthy();
    expect(errors?.intervalValue).toBeUndefined();
  });

  it("fails when a calendar unit is given without a value", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cubiertas",
        intervalValue: "",
        intervalCalendarValue: "",
        intervalCalendarUnit: "meses",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalCalendarValue).toBeTruthy();
  });

  it("fails when the usage interval is not a positive number", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cambio de aceite",
        intervalValue: "-100",
        intervalCalendarValue: "",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalValue).toBeTruthy();
  });

  it("fails when the calendar interval is not an integer", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cambio de aceite",
        intervalValue: "",
        intervalCalendarValue: "3.5",
        intervalCalendarUnit: "dias",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalCalendarValue).toBeTruthy();
  });

  it("fails when the calendar unit is not one of dias/meses", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "Cambio de aceite",
        intervalValue: "",
        intervalCalendarValue: "3",
        intervalCalendarUnit: "semanas",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.intervalCalendarUnit).toBeTruthy();
  });

  it("fails when the name is empty", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: VEHICLE_ID,
        name: "",
        intervalValue: "1000",
        intervalCalendarValue: "",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.name).toBeTruthy();
  });

  it("fails when vehicleId is not a valid uuid", () => {
    const errors = validateMaintenanceTypeFields(
      formData({
        vehicleId: "not-a-uuid",
        name: "Cambio de aceite",
        intervalValue: "1000",
        intervalCalendarValue: "",
        intervalCalendarUnit: "",
      }),
    );

    expect(errors).not.toBeNull();
    expect(errors?.vehicleId).toBeTruthy();
  });
});
