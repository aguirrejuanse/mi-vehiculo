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
import { nextPartStatus, type PartStatus } from "@/lib/validation/part";
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
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect("/dashboard");
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
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
