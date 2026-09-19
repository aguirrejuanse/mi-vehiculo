import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { parts, type NewPart, type Part } from "@/db/schema";

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
