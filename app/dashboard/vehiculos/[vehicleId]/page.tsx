import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsWithTypeForVehicle } from "@/db/queries/maintenance-logs";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const [maintenanceTypes, logs] = await Promise.all([
    listMaintenanceTypesForVehicle(vehicle.id),
    listMaintenanceLogsWithTypeForVehicle(vehicle.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <Link
        href="/dashboard"
        className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
      >
        ← Tus vehículos
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {vehicle.name}
            </h1>
            <Link
              href={`/dashboard/vehiculos/${vehicle.id}/editar`}
              className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
            >
              Editar
            </Link>
          </div>
          <p className="text-sm text-rb-muted">
            {vehicle.type} · {vehicle.currentValue} {vehicle.metricUnit}
          </p>
        </div>
        <div className="flex gap-3 text-xs font-bold tracking-widest uppercase">
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            className="rounded-sm border border-surface-border px-4 py-2 text-rb-yellow transition-colors hover:text-foreground"
          >
            + Mantenimiento
          </Link>
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
            className="rounded-sm bg-rb-red px-4 py-2 text-white transition-colors hover:bg-rb-red-hover"
          >
            + Registro
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-rb-muted uppercase">
          Historial
        </h2>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-surface-border py-16 text-center">
            <p className="text-sm text-rb-muted">
              Todavía no hay registros de mantenimiento para este vehículo.
            </p>
            {maintenanceTypes.length === 0 ? (
              <Link
                href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
                className="rounded-sm bg-rb-red px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
              >
                Cargar mantenimiento
              </Link>
            ) : (
              <Link
                href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
                className="rounded-sm bg-rb-red px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
              >
                Cargar registro
              </Link>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-1 rounded-sm border border-surface-border bg-surface/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold">{log.maintenanceType.name}</p>
                  <p className="text-xs text-rb-muted">
                    {new Date(log.performedAtDate).toLocaleDateString(
                      "es-AR",
                    )}
                  </p>
                </div>
                <p className="text-sm text-rb-muted">
                  {log.performedAtValue} {vehicle.metricUnit}
                </p>
                {log.notes && (
                  <p className="text-sm text-foreground">{log.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
