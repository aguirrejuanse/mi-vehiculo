"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import {
  archiveVehicle,
  getVehicleForUser,
  restoreVehicle,
} from "@/db/queries/vehicles";
import { getPartForVehicle, updatePartStatus } from "@/db/queries/parts";
import {
  archiveMaintenanceType,
  getMaintenanceTypeForVehicle,
  restoreMaintenanceType,
} from "@/db/queries/maintenance-types";
import { track } from "@/lib/analytics/server";
import { nextPartStatus, type PartStatus } from "@/lib/validation/part";
import {
  listMaintenanceLogsWithTypeForVehicle,
  LOGS_PAGE_SIZE,
  type MaintenanceLogWithTypeAndEditCount,
} from "@/db/queries/maintenance-logs";
import type { ActionState } from "@/lib/validation/action-state";

const STALE_MESSAGE = "Ese repuesto ya cambió de estado, refrescá la página.";

export async function advancePartStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const partId = formData.get("partId");
  const vehicleId = formData.get("vehicleId");
  const expectedStatus = formData.get("expectedStatus") as PartStatus | null;

  if (typeof partId !== "string" || typeof vehicleId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
  }

  const part = await getPartForVehicle(partId, vehicle.id);
  if (!part) {
    return { status: "error", message: "No encontramos ese repuesto." };
  }

  // Stale-render guard only: this comparison can produce a friendlier
  // message, but it never decides the transition — the target status is
  // always derived below from the freshly-fetched `part.status`.
  if (part.status !== expectedStatus) {
    return { status: "error", message: STALE_MESSAGE };
  }

  const next = nextPartStatus(part.status);
  if (!next) {
    return { status: "error", message: "Ese repuesto ya está instalado." };
  }

  const updated = await updatePartStatus(
    partId,
    vehicle.id,
    part.status,
    next,
  );
  if (!updated) {
    return { status: "error", message: STALE_MESSAGE };
  }

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  return { status: "success" };
}

export async function archiveVehicleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }

  await archiveVehicle(vehicle.id, userId);

  track("vehicle_archived", { vehicle_id: vehicle.id }, { userId });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect("/dashboard");
}

// Same archived-guard reasoning as vehicles: archiving a type is soft-delete —
// its logs and linked parts keep their data; only next-due and selects hide it.
export async function archiveMaintenanceTypeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const vehicleId = formData.get("vehicleId");
  const typeId = formData.get("typeId");

  if (typeof vehicleId !== "string" || typeof typeId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
  }

  const type = await getMaintenanceTypeForVehicle(typeId, vehicle.id);
  if (!type) {
    return { status: "error", message: "No encontramos ese mantenimiento." };
  }

  await archiveMaintenanceType(type.id, vehicle.id);

  track(
    "maintenance_type_archived",
    { vehicle_id: vehicle.id, type_id: type.id },
    { userId },
  );

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  revalidatePath("/dashboard");
  return { status: "success" };
}

export async function restoreMaintenanceTypeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const vehicleId = formData.get("vehicleId");
  const typeId = formData.get("typeId");

  if (typeof vehicleId !== "string" || typeof typeId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
  }

  const type = await getMaintenanceTypeForVehicle(typeId, vehicle.id);
  if (!type) {
    return { status: "error", message: "No encontramos ese mantenimiento." };
  }

  await restoreMaintenanceType(type.id, vehicle.id);

  track(
    "maintenance_type_restored",
    { vehicle_id: vehicle.id, type_id: type.id },
    { userId },
  );

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  revalidatePath("/dashboard");
  return { status: "success" };
}

// Data-fetching action for the "Cargar más" button: returns serialized log
// pages — offset pagination keeps it simple and stable enough for an
// append-mostly list (new logs land on top, never inside loaded pages).
export async function loadMoreMaintenanceLogsAction(
  vehicleId: string,
  offset: number,
): Promise<{ logs: MaintenanceLogWithTypeAndEditCount[]; hasMore: boolean }> {
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) return { logs: [], hasMore: false };

  const logs = await listMaintenanceLogsWithTypeForVehicle(vehicle.id, {
    limit: LOGS_PAGE_SIZE + 1,
    offset,
  });
  return { logs: logs.slice(0, LOGS_PAGE_SIZE), hasMore: logs.length > LOGS_PAGE_SIZE };
}

export async function restoreVehicleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const vehicleId = formData.get("vehicleId");

  if (typeof vehicleId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }

  await restoreVehicle(vehicle.id, userId);

  track("vehicle_restored", { vehicle_id: vehicle.id }, { userId });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
