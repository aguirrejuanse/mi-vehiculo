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
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Tus <span className="text-rb-red">vehículos</span>
        </h1>
        <Link
          href="/dashboard/vehiculos/nuevo"
          className="rounded-sm bg-rb-red px-4 py-2 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
        >
          Nuevo vehículo
        </Link>
      </div>

      {myVehicles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-surface-border py-24 text-center">
          <p className="text-rb-muted">Todavía no tenés vehículos cargados.</p>
          <Link
            href="/dashboard/vehiculos/nuevo"
            className="rounded-sm bg-rb-red px-4 py-2 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
          >
            Cargar mi primer vehículo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myVehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="flex flex-col gap-3 rounded-sm border border-surface-border bg-surface/40 p-4"
            >
              <div>
                <p className="font-bold">{vehicle.name}</p>
                <p className="text-sm text-rb-muted">
                  {vehicle.type} · {vehicle.currentValue} {vehicle.metricUnit}
                </p>
              </div>
              <div className="flex gap-3 text-xs font-bold tracking-wide uppercase">
                <Link
                  href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
                  className="text-rb-yellow transition-colors hover:text-foreground"
                >
                  + Mantenimiento
                </Link>
                <Link
                  href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
                  className="text-rb-yellow transition-colors hover:text-foreground"
                >
                  + Registro
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
