import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import {
  getMaintenanceLogWithTypeForVehicle,
  listMaintenanceLogEdits,
} from "@/db/queries/maintenance-logs";
import { formatDate, formatDateTime } from "@/lib/format";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MaintenanceLogHistoryPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/registros/[logId]/historial">) {
  const { vehicleId, logId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const log = await getMaintenanceLogWithTypeForVehicle(logId, vehicle.id);

  if (!log) notFound();

  const edits = await listMaintenanceLogEdits(log.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>
        {vehicle.name}
      </BackLink>
      <PageTitle highlight="registro">Historial del</PageTitle>
      <p className="text-sm text-rb-muted">{log.maintenanceType.name}</p>

      {edits.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-rb-muted">
            Este registro todavía no fue editado.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {edits.map((edit) => (
            <Card key={edit.id} as="li" padding="md" className="flex flex-col gap-1">
              <p className="text-xs font-bold tracking-widest text-rb-muted uppercase">
                Antes del {formatDate(edit.editedAt)}
              </p>
              <p className="text-sm text-rb-muted">
                {edit.previousPerformedAtValue} {vehicle.metricUnit} ·{" "}
                {formatDateTime(edit.previousPerformedAtDate)}
              </p>
              {edit.previousNotes && (
                <p className="text-sm text-foreground">
                  {edit.previousNotes}
                </p>
              )}
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
