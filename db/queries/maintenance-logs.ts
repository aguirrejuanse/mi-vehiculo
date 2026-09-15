import { and, desc, eq } from "drizzle-orm";
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
  input: Pick<NewMaintenanceLog, "performedAtValue" | "performedAtDate" | "notes">,
): Promise<MaintenanceLog | null> {
  // Editing is no longer limited to once: every edit snapshots the current
  // (about-to-be-overwritten) values into maintenance_log_edits before the
  // update, so the full history can be reconstructed. Insert + update run
  // in one transaction so the history entry and the new values stay in sync.
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(maintenanceLogs)
      .where(
        and(
          eq(maintenanceLogs.id, logId),
          eq(maintenanceLogs.vehicleId, vehicleId),
        ),
      );

    if (!current) return null;

    await tx.insert(maintenanceLogEdits).values({
      maintenanceLogId: current.id,
      previousPerformedAtValue: current.performedAtValue,
      previousPerformedAtDate: current.performedAtDate,
      previousNotes: current.notes,
    });

    const [updated] = await tx
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
  });
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
