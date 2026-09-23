import { notFound, redirect } from "next/navigation";
import { filterSuffix } from "@/lib/dashboard-filters";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { getMaintenanceLogWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { MaintenanceLogEditForm } from "@/app/dashboard/vehiculos/[vehicleId]/registros/[logId]/editar/maintenance-log-edit-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function EditMaintenanceLogPage({
  params,
  searchParams,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/registros/[logId]/editar">) {
  const { vehicleId, logId } = await params;
  const { tipo, ver } = await searchParams;
  const suffix = filterSuffix({ tipo, ver });
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();
  if (vehicle.archivedAt)
    redirect(`/dashboard/vehiculos/${vehicle.id}${suffix}`);

  const log = await getMaintenanceLogWithTypeForVehicle(logId, vehicle.id);

  if (!log) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}${suffix}`}>
        Volver
      </BackLink>
      <div className="flex flex-col gap-1">
        <p className="wrap-anywhere text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="registro">Editar</PageTitle>
      </div>

      <MaintenanceLogEditForm
        vehicleId={vehicle.id}
        metricUnitLabel={vehicle.metricUnit}
        log={log}
      />
    </div>
  );
}
