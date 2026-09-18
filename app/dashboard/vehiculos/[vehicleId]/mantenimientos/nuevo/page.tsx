import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { MaintenanceTypeForm } from "@/app/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo/maintenance-type-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function NewMaintenanceTypePage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>
        {vehicle.name}
      </BackLink>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="mantenimiento">Nuevo</PageTitle>
      </div>
      <MaintenanceTypeForm
        vehicleId={vehicle.id}
        metricUnitLabel={vehicle.metricUnit}
      />
    </div>
  );
}
