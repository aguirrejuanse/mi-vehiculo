"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { createMaintenanceLog } from "@/db/queries/maintenance-logs";
import { db } from "@/db";
import { maintenanceLogs, maintenanceTypes } from "@/db/schema";
import { computeNextDue } from "@/lib/maintenance/next-due";
import { track } from "@/lib/analytics/server";
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
  if (vehicle.archivedAt) {
    return { status: "error", message: "Este vehículo está archivado." };
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

  const previousLogs = await db
    .select({
      performedAtValue: maintenanceLogs.performedAtValue,
      performedAtDate: maintenanceLogs.performedAtDate,
    })
    .from(maintenanceLogs)
    .where(
      and(
        eq(maintenanceLogs.vehicleId, vehicle.id),
        eq(maintenanceLogs.maintenanceTypeId, maintenanceType.id),
      ),
    );

  const nextDue = computeNextDue({
    maintenanceType,
    logs: previousLogs,
    currentValue: parsed.data.performedAtValue,
    now: new Date(parsed.data.performedAtDate),
  });

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

  const daysOverdue =
    nextDue.dateDue && nextDue.daysRemaining != null && nextDue.daysRemaining < 0
      ? Math.ceil(Math.abs(nextDue.daysRemaining))
      : null;
  const usageOverdue =
    nextDue.usageDue != null &&
    nextDue.usageRemaining != null &&
    nextDue.usageRemaining < 0
      ? Math.ceil(Math.abs(nextDue.usageRemaining))
      : null;

  track(
    "maintenance_log_created",
    {
      vehicle_id: vehicle.id,
      maintenance_type_id: maintenanceType.id,
      performed_at_value: parsed.data.performedAtValue,
      computed_due_at: nextDue.dateDue?.toISOString() ?? null,
      computed_due_value: nextDue.usageDue ?? null,
      is_overdue: nextDue.status === "vencido",
      days_overdue: daysOverdue,
      usage_overdue: usageOverdue,
      trigger: nextDue.trigger,
    },
    { userId },
  );

  revalidatePath(`/dashboard/vehiculos/${vehicle.id}`);
  redirect(`/dashboard/vehiculos/${vehicle.id}`);
}
