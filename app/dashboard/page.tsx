import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { LinkButton } from "@/components/ui/link-button";
import { PageTitle } from "@/components/ui/page-title";

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
        <PageTitle highlight="vehículos">Tus</PageTitle>
        <LinkButton href="/dashboard/vehiculos/nuevo">
          Nuevo vehículo
        </LinkButton>
      </div>

      {myVehicles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-surface-border py-24 text-center">
          <p className="text-rb-muted">Todavía no tenés vehículos cargados.</p>
          <LinkButton href="/dashboard/vehiculos/nuevo">
            Cargar mi primer vehículo
          </LinkButton>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myVehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <Link
                href={`/dashboard/vehiculos/${vehicle.id}`}
                className="flex flex-col gap-1 rounded-sm border border-surface-border bg-surface/40 p-4 transition-colors hover:border-rb-red"
              >
                <p className="font-bold">{vehicle.name}</p>
                <p className="text-sm text-rb-muted">
                  {vehicle.type} · {vehicle.currentValue} {vehicle.metricUnit}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
