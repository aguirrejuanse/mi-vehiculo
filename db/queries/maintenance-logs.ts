import { desc, eq } from "drizzle-orm";
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
