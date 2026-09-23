"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { track } from "@/lib/analytics/server";
import {
  getMaintenanceTypeForVehicle,
  updateMaintenanceType,
} from "@/db/queries/maintenance-types";
import {
  maintenanceTypeUpdateSchema,
  type MaintenanceTypeUpdateInput,
} from "@/lib/validation/maintenance-type";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function updateMaintenanceTypeAction(
  _prevState: ActionState<MaintenanceTypeUpdateInput>,
  formData: FormData,
): Promise<ActionState<MaintenanceTypeUpdateInput>> {
  const userId = await requireUserId();

  const parsed = maintenanceTypeUpdateSchema.safeParse({
    typeId: formData.get("typeId"),
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    intervalValue: formData.get("intervalValue"),
    intervalCalendarValue: formData.get("intervalCalendarValue"),
    intervalCalendarUnit: formData.get("intervalCalendarUnit"),
    noInterval: formData.get("noInterval"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<MaintenanceTypeUpdateInput>(
        parsed.error,
      ),
    };
  }

  const vehicle = await getVehicleForUser(parsed.data.vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
  }

  const existing = await getMaintenanceTypeForVehicle(
    parsed.data.typeId,
    vehicle.id,
  );
  if (!existing) {
    return { status: "error", message: "No encontramos ese mantenimiento." };
  }
  if (existing.archivedAt) {
    return {
      status: "error",
      message: "Este mantenimiento está archivado.",
    };
  }

  try {
    const updated = await updateMaintenanceType(existing.id, vehicle.id, {
      name: parsed.data.name,
      intervalValue: parsed.data.intervalValue ?? null,
      intervalCalendarValue: parsed.data.intervalCalendarValue ?? null,
      intervalCalendarUnit: parsed.data.intervalCalendarUnit ?? null,
    });
    if (!updated) {
      return {
        status: "error",
        message: "No encontramos ese mantenimiento.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el mantenimiento. Probá de nuevo.",
    };
  }

  track(
    "maintenance_type_edited",
    {
      vehicle_id: vehicle.id,
      type_id: existing.id,
      has_interval_value: parsed.data.intervalValue != null,
      has_calendar_interval:
        parsed.data.intervalCalendarValue != null &&
        parsed.data.intervalCalendarUnit != null,
    },
    { userId },
  );

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
