import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { MaintenanceLogForm } from "@/app/dashboard/vehiculos/[vehicleId]/registros/nuevo/maintenance-log-form";
import { BackLink } from "@/components/ui/back-link";
import { LinkButton } from "@/components/ui/link-button";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function NewMaintenanceLogPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/registros/nuevo">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const maintenanceTypes = await listMaintenanceTypesForVehicle(vehicle.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>Volver</BackLink>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="registro">Nuevo</PageTitle>
      </div>

      {maintenanceTypes.length === 0 ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-surface-border p-6 text-center">
          <p className="text-sm text-muted">
            Todavía no cargaste tipos de mantenimiento para este vehículo.
          </p>
          <LinkButton
            href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            size="md"
            className="mx-auto"
          >
            Cargar mantenimiento
          </LinkButton>
        </div>
      ) : (
        <MaintenanceLogForm
          vehicleId={vehicle.id}
          metricUnitLabel={vehicle.metricUnit}
          maintenanceTypes={maintenanceTypes}
        />
      )}
    </div>
  );
}
