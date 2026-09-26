"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import {
  createMaintenanceTypes,
  listMaintenanceTypesForVehicle,
} from "@/db/queries/maintenance-types";
import { getSuggestedMaintenances } from "@/lib/maintenance/templates";
import { track } from "@/lib/analytics/server";
import type { ActionState } from "@/lib/validation/action-state";

// The client submits catalog KEYS only — names and intervals are resolved
// here from the template, so a crafted request can pick a subset of the
// catalog but can never inject its own intervals or names.
export async function addSuggestedTypesAction(
  vehicleId: string,
  keys: string[],
): Promise<ActionState> {
  const userId = await requireUserId();
  if (!Array.isArray(keys)) {
    return { status: "error", message: "Solicitud inválida." };
  }

  const vehicle = await getVehicleForUser(vehicleId, userId);
  if (!vehicle) {
    return { status: "error", message: "No encontramos ese vehículo." };
  }
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
  }

  const selected = new Set(keys);
  // Dedupe by name against ALL existing types — archived included, so a
  // re-applied plan can't clash with a row a later restore would unhide.
  // The /listo page already redirects away once the vehicle has any active
  // types, but a back-button resubmit or double-click can race past it.
  const existingNames = new Set(
    (await listMaintenanceTypesForVehicle(vehicle.id, true)).map(
      (t) => t.name,
    ),
  );
  const items = getSuggestedMaintenances(
    vehicle.type,
    vehicle.subtype,
    vehicle.metricUnit,
  ).filter((item) => selected.has(item.key) && !existingNames.has(item.name));

  try {
    await createMaintenanceTypes(
      items.map((item) => ({
        vehicleId: vehicle.id,
        name: item.name,
        intervalValue: item.intervalValue,
        intervalCalendarValue: item.intervalCalendarValue,
        intervalCalendarUnit: item.intervalCalendarUnit,
      })),
    );
  } catch {
    return {
      status: "error",
      message: "No se pudieron guardar los mantenimientos. Probá de nuevo.",
    };
  }

  for (const item of items) {
    track(
      "maintenance_type_created",
      {
        vehicle_id: vehicle.id,
        has_interval_value: item.intervalValue != null,
        has_calendar_interval:
          item.intervalCalendarValue != null &&
          item.intervalCalendarUnit != null,
        source: "suggested",
      },
      { userId },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  // Empty selection (a crafted submit with no keys — the button is disabled
  // at 0 in the UI) skips the inserts and just lands on the vehicle page.
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}

// Form adapter for `useActionState`: the plan checkboxes submit their key
// as repeated `suggested` FormData values — see plan-form.tsx.
export async function addSuggestedTypesFormAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const vehicleId = formData.get("vehicleId");
  if (typeof vehicleId !== "string") {
    return { status: "error", message: "Solicitud inválida." };
  }
  const keys = formData
    .getAll("suggested")
    .filter((key): key is string => typeof key === "string");
  return addSuggestedTypesAction(vehicleId, keys);
}
