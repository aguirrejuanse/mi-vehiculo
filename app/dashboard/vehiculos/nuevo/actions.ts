"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { createVehicle } from "@/db/queries/vehicles";
import {
  vehicleSchema,
  type VehicleInput,
} from "@/lib/validation/vehicle";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function createVehicleAction(
  _prevState: ActionState<VehicleInput>,
  formData: FormData,
): Promise<ActionState<VehicleInput>> {
  const userId = await requireUserId();

  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<VehicleInput>(parsed.error),
    };
  }

  let vehicle;
  try {
    vehicle = await createVehicle({
      userId,
      name: parsed.data.name,
      type: parsed.data.type,
      metricUnit: parsed.data.metricUnit,
      currentValue: parsed.data.currentValue,
      usageRatePerWeek: parsed.data.usageRatePerWeek ?? null,
    });
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el vehículo. Probá de nuevo.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
