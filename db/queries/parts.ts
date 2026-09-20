import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { parts, type NewPart, type Part } from "@/db/schema";
import type { PartStatus } from "@/lib/validation/part";

export async function createPart(input: NewPart): Promise<Part> {
  const [part] = await db.insert(parts).values(input).returning();
  return part;
}

export async function listPartsForVehicle(
  vehicleId: string,
): Promise<Part[]> {
  return db
    .select()
    .from(parts)
    .where(eq(parts.vehicleId, vehicleId))
    .orderBy(desc(parts.createdAt));
}

export async function getPartForVehicle(
  partId: string,
  vehicleId: string,
): Promise<Part | null> {
  const [part] = await db
    .select()
    .from(parts)
    .where(and(eq(parts.id, partId), eq(parts.vehicleId, vehicleId)));
  return part ?? null;
}

// Compare-and-swap: the WHERE clause pins the write to the status the caller
// just read. An empty `.returning()` means someone else already moved the
// part (or it doesn't exist / isn't owned) — that's the concurrency guard,
// not a db.transaction() (unavailable on the neon-http driver, see
// maintenance-logs.ts:75-79).
export async function updatePartStatus(
  partId: string,
  vehicleId: string,
  fromStatus: PartStatus,
  toStatus: PartStatus,
): Promise<Part | null> {
  const [part] = await db
    .update(parts)
    .set({ status: toStatus })
    .where(
      and(
        eq(parts.id, partId),
        eq(parts.vehicleId, vehicleId),
        eq(parts.status, fromStatus),
      ),
    )
    .returning();
  return part ?? null;
}
