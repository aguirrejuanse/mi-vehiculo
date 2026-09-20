"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { getMaintenanceTypeForVehicle } from "@/db/queries/maintenance-types";
import { getMaintenanceLogWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { createPart } from "@/db/queries/parts";
import { partSchema, type PartInput } from "@/lib/validation/part";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function createPartAction(
  _prevState: ActionState<PartInput>,
  formData: FormData,
): Promise<ActionState<PartInput>> {
  const userId = await requireUserId();

  const parsed = partSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    maintenanceTypeId: formData.get("maintenanceTypeId"),
    maintenanceLogId: formData.get("maintenanceLogId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<PartInput>(parsed.error),
    };
  }

  const vehicle = await getVehicleForUser(parsed.data.vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }

  if (parsed.data.maintenanceTypeId) {
    const maintenanceType = await getMaintenanceTypeForVehicle(
      parsed.data.maintenanceTypeId,
      vehicle.id,
    );
    if (!maintenanceType) {
      return {
        status: "error",
        fieldErrors: { maintenanceTypeId: "Elegí un mantenimiento válido." },
      };
    }
  }

  if (parsed.data.maintenanceLogId) {
    const maintenanceLog = await getMaintenanceLogWithTypeForVehicle(
      parsed.data.maintenanceLogId,
      vehicle.id,
    );
    if (!maintenanceLog) {
      return {
        status: "error",
        fieldErrors: { maintenanceLogId: "Elegí un registro válido." },
      };
    }
  }

  // A retroactive quality note (linked to a log) is born already installed —
  // it doesn't pass through wishlist/pendiente_instalar. Everything else
  // defaults to wishlist.
  const status = parsed.data.maintenanceLogId ? "instalado" : "wishlist";

  try {
    await createPart({
      vehicleId: vehicle.id,
      name: parsed.data.name,
      status,
      maintenanceTypeId: parsed.data.maintenanceTypeId ?? null,
      maintenanceLogId: parsed.data.maintenanceLogId ?? null,
      notes: parsed.data.notes ?? null,
    });
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar el repuesto. Probá de nuevo.",
    };
  }

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
