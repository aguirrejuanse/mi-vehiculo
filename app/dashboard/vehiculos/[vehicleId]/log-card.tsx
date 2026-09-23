import { formatDateUTC, formatMetric } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { SectionLink } from "@/components/ui/section";
import type { MaintenanceLogWithTypeAndEditCount } from "@/db/queries/maintenance-logs";

// Shared between the server-rendered initial page and the client-side
// "Cargar más" appends — keep it free of server-only imports.
export function LogCard({
  log,
  vehicleId,
  metricUnit,
  suffix,
  isArchived,
}: {
  log: MaintenanceLogWithTypeAndEditCount;
  vehicleId: string;
  metricUnit: string;
  suffix: string;
  isArchived: boolean;
}) {
  return (
    <Card as="li" className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="font-bold">{log.maintenanceType.name}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted">
            {formatDateUTC(log.performedAtDate)}
          </p>
          {log.editCount > 0 && (
            <SectionLink
              href={`/dashboard/vehiculos/${vehicleId}/registros/${log.id}/historial${suffix}`}
            >
              Editado ({log.editCount})
            </SectionLink>
          )}
          {!isArchived && (
            <SectionLink
              href={`/dashboard/vehiculos/${vehicleId}/registros/${log.id}/editar${suffix}`}
            >
              Editar
            </SectionLink>
          )}
        </div>
      </div>
      <p className="text-sm text-muted">
        {formatMetric(log.performedAtValue)} {metricUnit}
      </p>
      {log.notes && <p className="text-sm text-foreground">{log.notes}</p>}
    </Card>
  );
}
