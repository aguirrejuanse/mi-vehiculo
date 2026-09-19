"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { createMaintenanceType } from "@/db/queries/maintenance-types";
import {
  maintenanceTypeSchema,
  type MaintenanceTypeInput,
} from "@/lib/validation/maintenance-type";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function createMaintenanceTypeAction(
  _prevState: ActionState<MaintenanceTypeInput>,
  formData: FormData,
): Promise<ActionState<MaintenanceTypeInput>> {
  const userId = await requireUserId();

  const parsed = maintenanceTypeSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    intervalValue: formData.get("intervalValue"),
    intervalCalendarValue: formData.get("intervalCalendarValue"),
    intervalCalendarUnit: formData.get("intervalCalendarUnit"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<MaintenanceTypeInput>(
        parsed.error,
      ),
    };
  }

  const vehicle = await getVehicleForUser(parsed.data.vehicleId, userId);
  if (!vehicle) {
    return {
      status: "error",
      message: "No encontramos ese vehículo.",
    };
  }

  try {
    await createMaintenanceType({
      vehicleId: parsed.data.vehicleId,
      name: parsed.data.name,
      intervalValue: parsed.data.intervalValue,
      intervalCalendarValue: parsed.data.intervalCalendarValue,
      intervalCalendarUnit: parsed.data.intervalCalendarUnit,
    });
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el mantenimiento. Probá de nuevo.",
    };
  }

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
