import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  maintenanceTypes,
  type MaintenanceType,
  type NewMaintenanceType,
} from "@/db/schema";

export async function createMaintenanceType(
  input: NewMaintenanceType,
): Promise<MaintenanceType> {
  const [maintenanceType] = await db
    .insert(maintenanceTypes)
    .values(input)
    .returning();
  return maintenanceType;
}

export async function listMaintenanceTypesForVehicle(
  vehicleId: string,
): Promise<MaintenanceType[]> {
  return db
    .select()
    .from(maintenanceTypes)
    .where(eq(maintenanceTypes.vehicleId, vehicleId));
}
