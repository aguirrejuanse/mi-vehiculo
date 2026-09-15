"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { createMaintenanceLog } from "@/db/queries/maintenance-logs";
import { db } from "@/db";
import { maintenanceTypes } from "@/db/schema";
import {
  maintenanceLogSchema,
  type MaintenanceLogInput,
} from "@/lib/validation/maintenance-log";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function createMaintenanceLogAction(
  _prevState: ActionState<MaintenanceLogInput>,
  formData: FormData,
): Promise<ActionState<MaintenanceLogInput>> {
  const userId = await requireUserId();

  const parsed = maintenanceLogSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    maintenanceTypeId: formData.get("maintenanceTypeId"),
    performedAtValue: formData.get("performedAtValue"),
    performedAtDate: formData.get("performedAtDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<MaintenanceLogInput>(parsed.error),
    };
  }

  const vehicle = await getVehicleForUser(parsed.data.vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }

  const [maintenanceType] = await db
    .select()
    .from(maintenanceTypes)
    .where(eq(maintenanceTypes.id, parsed.data.maintenanceTypeId));

  if (!maintenanceType || maintenanceType.vehicleId !== vehicle.id) {
    return {
      status: "error",
      fieldErrors: { maintenanceTypeId: "Elegí un mantenimiento válido." },
    };
  }

  try {
    await createMaintenanceLog({
      vehicleId: vehicle.id,
      maintenanceTypeId: parsed.data.maintenanceTypeId,
      performedAtValue: parsed.data.performedAtValue,
      performedAtDate: new Date(parsed.data.performedAtDate),
      notes: parsed.data.notes ?? null,
    });
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el registro. Probá de nuevo.",
    };
  }

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
