import { and, eq } from "drizzle-orm";
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

export async function listVehiclesForUser(userId: string): Promise<Vehicle[]> {
  return db.select().from(vehicles).where(eq(vehicles.userId, userId));
}
