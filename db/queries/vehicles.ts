import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { vehicles, type NewVehicle, type Vehicle } from "@/db/schema";

export async function createVehicle(input: NewVehicle): Promise<Vehicle> {
  const [vehicle] = await db.insert(vehicles).values(input).returning();
  return vehicle;
}

export async function getVehicleForUser(
  vehicleId: string,
  userId: string,
): Promise<Vehicle | null> {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)));
  return vehicle ?? null;
}

export async function listVehiclesForUser(
  userId: string,
  includeArchived: boolean = false,
): Promise<Vehicle[]> {
  const conditions = [eq(vehicles.userId, userId)];
  if (!includeArchived) {
    conditions.push(isNull(vehicles.archivedAt));
  }
  return db.select().from(vehicles).where(and(...conditions));
}

export async function updateVehicle(
  vehicleId: string,
  userId: string,
  input: Partial<NewVehicle>,
): Promise<Vehicle> {
  const [vehicle] = await db
    .update(vehicles)
    .set(input)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .returning();
  return vehicle;
}

export async function archiveVehicle(
  vehicleId: string,
  userId: string,
): Promise<Vehicle | null> {
  const [vehicle] = await db
    .update(vehicles)
    .set({ archivedAt: new Date() })
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .returning();
  return vehicle ?? null;
}

export async function restoreVehicle(
  vehicleId: string,
  userId: string,
): Promise<Vehicle | null> {
  const [vehicle] = await db
    .update(vehicles)
    .set({ archivedAt: null })
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)))
    .returning();
  return vehicle ?? null;
}
