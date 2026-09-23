import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  maintenanceLogEdits,
  maintenanceLogs,
  type MaintenanceLog,
  type MaintenanceLogEdit,
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

// Batch variant of listMaintenanceLogsForVehicle: one query for a set of
// vehicle ids (dashboard list computes next-due status per vehicle).
export async function listMaintenanceLogsForVehicles(
  vehicleIds: string[],
): Promise<MaintenanceLog[]> {
  if (vehicleIds.length === 0) return [];
  return db
    .select()
    .from(maintenanceLogs)
    .where(inArray(maintenanceLogs.vehicleId, vehicleIds));
}

export type MaintenanceLogWithType = MaintenanceLog & {
  maintenanceType: MaintenanceType;
};

export type MaintenanceLogWithTypeAndEditCount = MaintenanceLogWithType & {
  editCount: number;
};

export async function listMaintenanceLogsWithTypeForVehicle(
  vehicleId: string,
): Promise<MaintenanceLogWithTypeAndEditCount[]> {
  const logs = await db.query.maintenanceLogs.findMany({
    where: eq(maintenanceLogs.vehicleId, vehicleId),
    orderBy: desc(maintenanceLogs.performedAtDate),
    with: { maintenanceType: true, edits: true },
  });

  return logs.map(({ edits, ...log }) => ({
    ...log,
    editCount: edits.length,
  }));
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
  editedBy: string,
  input: Pick<NewMaintenanceLog, "performedAtValue" | "performedAtDate" | "notes">,
): Promise<MaintenanceLog | null> {
  // Editing is no longer limited to once: every edit snapshots the current
  // (about-to-be-overwritten) values into maintenance_log_edits before the
  // update, so the full history can be reconstructed.
  //
  // Not wrapped in a db.transaction: the neon-http driver has no transaction
  // support (it throws on db.transaction()). Sequential writes are fine here
  // since a single owner editing the same log twice at the exact same instant
  // is not a realistic case for this app; worst case is a duplicated snapshot
  // in the history, never data loss.
  const [current] = await db
    .select()
    .from(maintenanceLogs)
    .where(
      and(
        eq(maintenanceLogs.id, logId),
        eq(maintenanceLogs.vehicleId, vehicleId),
      ),
    );

  if (!current) return null;

  await db.insert(maintenanceLogEdits).values({
    maintenanceLogId: current.id,
    editedBy,
    previousPerformedAtValue: current.performedAtValue,
    previousPerformedAtDate: current.performedAtDate,
    previousNotes: current.notes,
  });

  const [updated] = await db
    .update(maintenanceLogs)
    .set({ ...input, lastEditedAt: new Date() })
    .where(
      and(
        eq(maintenanceLogs.id, logId),
        eq(maintenanceLogs.vehicleId, vehicleId),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function listMaintenanceLogEdits(
  logId: string,
): Promise<MaintenanceLogEdit[]> {
  return db
    .select()
    .from(maintenanceLogEdits)
    .where(eq(maintenanceLogEdits.maintenanceLogId, logId))
    .orderBy(desc(maintenanceLogEdits.editedAt));
}
