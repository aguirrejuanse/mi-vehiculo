import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  maintenanceTypes,
  type MaintenanceType,
  type NewMaintenanceType,
} from "@/db/schema";
import { idSchema } from "@/lib/validation/id";

export async function createMaintenanceType(
  input: NewMaintenanceType,
): Promise<MaintenanceType> {
  const [maintenanceType] = await db
    .insert(maintenanceTypes)
    .values(input)
    .returning();
  return maintenanceType;
}

// Archived types are excluded by default — they must not appear in selects,
// next-due computation, or the dashboard status dots. Pass includeArchived
// for the management list (which needs to show them with a "archived" badge).
export async function listMaintenanceTypesForVehicle(
  vehicleId: string,
  includeArchived = false,
): Promise<MaintenanceType[]> {
  const conditions = [eq(maintenanceTypes.vehicleId, vehicleId)];
  if (!includeArchived) conditions.push(isNull(maintenanceTypes.archivedAt));
  return db
    .select()
    .from(maintenanceTypes)
    .where(and(...conditions));
}

// Batch variant of listMaintenanceTypesForVehicle: one query for a set of
// vehicle ids (dashboard list needs every type for every user vehicle).
// Never includes archived — a hidden type contributes no status.
export async function listMaintenanceTypesForVehicles(
  vehicleIds: string[],
): Promise<MaintenanceType[]> {
  if (vehicleIds.length === 0) return [];
  return db
    .select()
    .from(maintenanceTypes)
    .where(
      and(
        inArray(maintenanceTypes.vehicleId, vehicleIds),
        isNull(maintenanceTypes.archivedAt),
      ),
    );
}

export async function updateMaintenanceType(
  typeId: string,
  vehicleId: string,
  input: Pick<
    NewMaintenanceType,
    "name" | "intervalValue" | "intervalCalendarValue" | "intervalCalendarUnit"
  >,
): Promise<MaintenanceType | null> {
  const [updated] = await db
    .update(maintenanceTypes)
    .set(input)
    .where(
      and(
        eq(maintenanceTypes.id, typeId),
        eq(maintenanceTypes.vehicleId, vehicleId),
      ),
    )
    .returning();
  return updated ?? null;
}

export async function archiveMaintenanceType(
  typeId: string,
  vehicleId: string,
): Promise<void> {
  await db
    .update(maintenanceTypes)
    .set({ archivedAt: new Date() })
    .where(
      and(
        eq(maintenanceTypes.id, typeId),
        eq(maintenanceTypes.vehicleId, vehicleId),
        isNull(maintenanceTypes.archivedAt),
      ),
    );
}

export async function restoreMaintenanceType(
  typeId: string,
  vehicleId: string,
): Promise<void> {
  await db
    .update(maintenanceTypes)
    .set({ archivedAt: null })
    .where(
      and(
        eq(maintenanceTypes.id, typeId),
        eq(maintenanceTypes.vehicleId, vehicleId),
      ),
    );
}

export async function getMaintenanceTypeForVehicle(
  typeId: string,
  vehicleId: string,
): Promise<MaintenanceType | null> {
  if (
    !idSchema.safeParse(typeId).success ||
    !idSchema.safeParse(vehicleId).success
  ) {
    return null;
  }
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
