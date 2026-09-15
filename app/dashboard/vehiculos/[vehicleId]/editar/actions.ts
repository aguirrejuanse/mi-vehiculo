"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser, updateVehicle } from "@/db/queries/vehicles";
import {
  vehicleUpdateSchema,
  type VehicleUpdateInput,
} from "@/lib/validation/vehicle";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function updateVehicleAction(
  _prevState: ActionState<VehicleUpdateInput>,
  formData: FormData,
): Promise<ActionState<VehicleUpdateInput>> {
  const userId = await requireUserId();

  const parsed = vehicleUpdateSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    type: formData.get("type"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<VehicleUpdateInput>(parsed.error),
    };
  }

  const vehicle = await getVehicleForUser(parsed.data.vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }

  try {
    await updateVehicle(vehicle.id, userId, {
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
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`);
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
