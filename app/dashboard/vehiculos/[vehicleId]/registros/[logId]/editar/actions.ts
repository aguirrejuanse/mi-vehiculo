"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import {
  getMaintenanceLogWithTypeForVehicle,
  updateMaintenanceLog,
} from "@/db/queries/maintenance-logs";
import { track } from "@/lib/analytics/server";
import {
  maintenanceLogUpdateSchema,
  type MaintenanceLogUpdateInput,
} from "@/lib/validation/maintenance-log";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function updateMaintenanceLogAction(
  _prevState: ActionState<MaintenanceLogUpdateInput>,
  formData: FormData,
): Promise<ActionState<MaintenanceLogUpdateInput>> {
  const userId = await requireUserId();

  const parsed = maintenanceLogUpdateSchema.safeParse({
    logId: formData.get("logId"),
    vehicleId: formData.get("vehicleId"),
    performedAtValue: formData.get("performedAtValue"),
    performedAtDate: formData.get("performedAtDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<MaintenanceLogUpdateInput>(
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

  const log = await getMaintenanceLogWithTypeForVehicle(
    parsed.data.logId,
    vehicle.id,
  );
  if (!log) {
    return { status: "error", message: "No encontramos ese registro." };
  }

  try {
    const updated = await updateMaintenanceLog(log.id, vehicle.id, userId, {
      performedAtValue: parsed.data.performedAtValue,
      performedAtDate: new Date(parsed.data.performedAtDate),
      notes: parsed.data.notes ?? null,
    });

    if (!updated) {
      return { status: "error", message: "No encontramos ese registro." };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el registro. Probá de nuevo.",
    };
  }

  track(
    "maintenance_log_edited",
    { vehicle_id: vehicle.id, log_id: log.id },
    { userId },
  );

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  revalidatePath(
    `/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/historial`,
  );
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
