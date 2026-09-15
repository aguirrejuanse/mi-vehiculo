import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { getMaintenanceLogWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { MaintenanceLogEditForm } from "@/app/dashboard/vehiculos/[vehicleId]/registros/[logId]/editar/maintenance-log-edit-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function EditMaintenanceLogPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/registros/[logId]/editar">) {
  const { vehicleId, logId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const log = await getMaintenanceLogWithTypeForVehicle(logId, vehicle.id);

  if (!log) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>
        {vehicle.name}
      </BackLink>
      <PageTitle highlight="registro">Editar</PageTitle>

      <MaintenanceLogEditForm
        vehicleId={vehicle.id}
        metricUnitLabel={vehicle.metricUnit}
        log={log}
      />
    </div>
  );
}
