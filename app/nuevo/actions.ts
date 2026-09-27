"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createVehicle } from "@/db/queries/vehicles";
import { getSuggestedMaintenances } from "@/lib/maintenance/templates";
import { track } from "@/lib/analytics/server";
import {
  vehicleSchema,
  type VehicleInput,
} from "@/lib/validation/vehicle";
import {
  fieldErrorsFromZodError,
  type ActionState,
} from "@/lib/validation/action-state";

export async function createVehicleAction(
  _prevState: ActionState<VehicleInput>,
  formData: FormData,
): Promise<ActionState<VehicleInput>> {
  // Scoped to this action only (design D5): the guest flow dispatches this
  // action right after `signUp.finalize()`, in the narrow window where the
  // Clerk session may not have propagated to this request yet. Returning an
  // error here is retryable; `requireUserId()` throwing would blow up the
  // error boundary and wipe all client-held wizard state.
  const { userId } = await auth();
  if (!userId) {
    return {
      status: "error",
      message: "Tu sesión todavía se está activando. Probá de nuevo.",
    };
  }

  const source = String(formData.get("source") ?? "unknown");

  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    subtype: formData.get("subtype"),
    engine: formData.get("engine"),
    displacementCc: formData.get("displacementCc"),
    metricUnit: formData.get("metricUnit"),
    currentValue: formData.get("currentValue"),
    usageRatePerWeek: formData.get("usageRatePerWeek"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFromZodError<VehicleInput>(parsed.error),
    };
  }

  let vehicle;
  try {
    vehicle = await createVehicle({
      userId,
      name: parsed.data.name,
      type: parsed.data.type,
      subtype: parsed.data.subtype ?? null,
      engine: parsed.data.engine ?? null,
      displacementCc:
        parsed.data.displacementCc != null
          ? Number(parsed.data.displacementCc)
          : null,
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

  track(
    "wizard_completed",
    {
      vehicle_type: parsed.data.type,
      has_usage_rate: parsed.data.usageRatePerWeek != null,
      has_engine: parsed.data.engine != null,
      source,
    },
    { userId },
  );

  revalidatePath("/dashboard");
  // Vehicles with a suggested plan land on the "listo" interstitial first;
  // type/subtype combos the catalog doesn't cover go straight to the
  // vehicle page.
  const hasSuggestions =
    getSuggestedMaintenances(
      vehicle.type,
      vehicle.subtype,
      vehicle.metricUnit,
      vehicle.engine,
    ).length > 0;
  redirect(
    hasSuggestions
      ? `/dashboard/vehiculos/${vehicle.id}/listo`
      : `/dashboard/vehiculos/${vehicle.id}`,
  );
}
