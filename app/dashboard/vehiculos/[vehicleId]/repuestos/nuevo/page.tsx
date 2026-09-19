import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { PartForm } from "@/app/dashboard/vehiculos/[vehicleId]/repuestos/nuevo/part-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";
import { formatDateUTC } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewPartPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/repuestos/nuevo">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const [maintenanceTypes, logs] = await Promise.all([
    listMaintenanceTypesForVehicle(vehicle.id),
    listMaintenanceLogsWithTypeForVehicle(vehicle.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>
        {vehicle.name}
      </BackLink>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="repuesto">Nuevo</PageTitle>
      </div>
      <PartForm
        vehicleId={vehicle.id}
        maintenanceTypes={maintenanceTypes.map((type) => ({
          id: type.id,
          name: type.name,
        }))}
        maintenanceLogs={logs.map((log) => ({
          id: log.id,
          label: `${log.maintenanceType.name} · ${formatDateUTC(log.performedAtDate)}`,
        }))}
      />
    </div>
  );
}
