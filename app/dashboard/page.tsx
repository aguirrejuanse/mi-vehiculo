import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles } from "@/db/schema";

// This page reads live, per-user data (Clerk auth + Neon query) on every
// request, so it must not be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    // The middleware already protects this route, but keep this as a
    // defensive fallback for type-narrowing below.
    return null;
  }

  const myVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tus vehículos</h1>
        <Link
          href="/dashboard/vehiculos/nuevo"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Nuevo vehículo
        </Link>
      </div>

      {myVehicles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-black/10 py-24 text-center dark:border-white/10">
          <p className="text-zinc-600 dark:text-zinc-400">
            Todavía no tenés vehículos cargados.
          </p>
          <Link
            href="/dashboard/vehiculos/nuevo"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Cargar mi primer vehículo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myVehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <p className="font-medium">{vehicle.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {vehicle.type} · {vehicle.currentValue} {vehicle.metricUnit}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
