"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import {
  getMaintenanceLogWithTypeForVehicle,
  updateMaintenanceLog,
} from "@/db/queries/maintenance-logs";
import {
  maintenanceLogUpdateSchema,
  type MaintenanceLogUpdateInput,
} from "@/lib/validation/maintenance-log";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

const ALREADY_EDITED_MESSAGE =
  "Este registro ya fue editado una vez y no se puede modificar de nuevo.";

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

  const log = await getMaintenanceLogWithTypeForVehicle(
    parsed.data.logId,
    vehicle.id,
  );
  if (!log) {
    return { status: "error", message: "No encontramos ese registro." };
  }

  if (log.editedAt) {
    return { status: "error", message: ALREADY_EDITED_MESSAGE };
  }

  try {
    const updated = await updateMaintenanceLog(log.id, vehicle.id, {
      performedAtValue: parsed.data.performedAtValue,
      performedAtDate: new Date(parsed.data.performedAtDate),
      notes: parsed.data.notes ?? null,
    });

    if (!updated) {
      // Lost a race against a concurrent edit of the same log.
      return { status: "error", message: ALREADY_EDITED_MESSAGE };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el registro. Probá de nuevo.",
    };
  }

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
