import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  maintenanceLogs,
  type MaintenanceLog,
  type MaintenanceType,
  type NewMaintenanceLog,
} from "@/db/schema";

export async function createMaintenanceLog(
  input: NewMaintenanceLog,
): Promise<MaintenanceLog> {
  const [log] = await db.insert(maintenanceLogs).values(input).returning();
  return log;
}

export async function listMaintenanceLogsForVehicle(
  vehicleId: string,
): Promise<MaintenanceLog[]> {
  return db
    .select()
    .from(maintenanceLogs)
    .where(eq(maintenanceLogs.vehicleId, vehicleId));
}

export type MaintenanceLogWithType = MaintenanceLog & {
  maintenanceType: MaintenanceType;
};

export async function listMaintenanceLogsWithTypeForVehicle(
  vehicleId: string,
): Promise<MaintenanceLogWithType[]> {
  return db.query.maintenanceLogs.findMany({
    where: eq(maintenanceLogs.vehicleId, vehicleId),
    orderBy: desc(maintenanceLogs.performedAtDate),
    with: { maintenanceType: true },
  });
}

export async function getMaintenanceLogWithTypeForVehicle(
  logId: string,
  vehicleId: string,
): Promise<MaintenanceLogWithType | null> {
  const log = await db.query.maintenanceLogs.findFirst({
    where: and(
      eq(maintenanceLogs.id, logId),
      eq(maintenanceLogs.vehicleId, vehicleId),
    ),
    with: { maintenanceType: true },
  });
  return log ?? null;
}

export async function updateMaintenanceLog(
  logId: string,
  vehicleId: string,
  input: Pick<NewMaintenanceLog, "performedAtValue" | "performedAtDate" | "notes">,
): Promise<MaintenanceLog | null> {
  // The editedAt IS NULL check enforces the "single edit" rule at the
  // database level, closing the race window between the action's read
  // (getMaintenanceLogWithTypeForVehicle) and this write.
  const [log] = await db
    .update(maintenanceLogs)
    .set({ ...input, editedAt: new Date() })
    .where(
      and(
        eq(maintenanceLogs.id, logId),
        eq(maintenanceLogs.vehicleId, vehicleId),
        isNull(maintenanceLogs.editedAt),
      ),
    )
    .returning();
  return log ?? null;
}
