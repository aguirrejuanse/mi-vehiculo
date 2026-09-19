import { and, eq } from "drizzle-orm";
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

export async function getMaintenanceTypeForVehicle(
  typeId: string,
  vehicleId: string,
): Promise<MaintenanceType | null> {
  const [maintenanceType] = await db
    .select()
    .from(maintenanceTypes)
    .where(
      and(
        eq(maintenanceTypes.id, typeId),
        eq(maintenanceTypes.vehicleId, vehicleId),
      ),
    );
  return maintenanceType ?? null;
}
