import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { formatDate, formatTime } from "@/lib/format";
import { BackLink } from "@/components/ui/back-link";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";

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
      <BackLink href="/dashboard">Tus vehículos</BackLink>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {vehicle.name}
            </h1>
            <Link
              href={`/dashboard/vehiculos/${vehicle.id}/editar`}
              className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
            >
              Editar
            </Link>
          </div>
          <p className="text-sm text-muted">
            {vehicle.type} · {vehicle.currentValue} {vehicle.metricUnit}
          </p>
        </div>
        <div className="flex gap-3 text-xs font-bold tracking-widest uppercase">
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            className="rounded-2xl border border-surface-border px-4 py-2 text-accent transition-colors hover:text-foreground"
          >
            + Mantenimiento
          </Link>
          <LinkButton
            href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
            bare
          >
            + Registro
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
          Historial
        </h2>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border py-16 text-center">
            <p className="text-sm text-muted">
              Todavía no hay registros de mantenimiento para este vehículo.
            </p>
            {maintenanceTypes.length === 0 ? (
              <LinkButton
                href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
                size="md"
              >
                Cargar mantenimiento
              </LinkButton>
            ) : (
              <LinkButton
                href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
                size="md"
              >
                Cargar registro
              </LinkButton>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {logs.map((log) => (
              <Card as="li" key={log.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{log.maintenanceType.name}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted">
                      {formatDate(log.performedAtDate)} ·{" "}
                      {formatTime(log.lastEditedAt ?? log.createdAt)}
                    </p>
                    {log.editCount > 0 && (
                      <Link
                        href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/historial`}
                        className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
                      >
                        Editado ({log.editCount})
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/editar`}
                      className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {log.performedAtValue} {vehicle.metricUnit}
                </p>
                {log.notes && (
                  <p className="text-sm text-foreground">{log.notes}</p>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
