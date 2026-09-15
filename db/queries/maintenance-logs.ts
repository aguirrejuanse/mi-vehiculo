import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  maintenanceLogs,
  type MaintenanceLog,
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
