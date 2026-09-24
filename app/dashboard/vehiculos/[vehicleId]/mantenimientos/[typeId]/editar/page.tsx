import { notFound, redirect } from "next/navigation";
import { filterSuffix } from "@/lib/dashboard-filters";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { getMaintenanceTypeForVehicle } from "@/db/queries/maintenance-types";
import { MaintenanceTypeForm } from "@/app/dashboard/vehiculos/[vehicleId]/mantenimientos/nuevo/maintenance-type-form";
import { updateMaintenanceTypeAction } from "./actions";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function EditMaintenanceTypePage({
  params,
  searchParams,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/mantenimientos/[typeId]/editar">) {
  const { vehicleId, typeId } = await params;
  const { tipo, ver } = await searchParams;
  const suffix = filterSuffix({ tipo, ver });
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();
  if (vehicle.archivedAt)
    redirect(`/dashboard/vehiculos/${vehicle.id}${suffix}`);

  const maintenanceType = await getMaintenanceTypeForVehicle(
    typeId,
    vehicle.id,
  );

  if (!maintenanceType || maintenanceType.archivedAt) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}${suffix}`}>
        Volver
      </BackLink>
      <div className="flex flex-col gap-1">
        <p className="wrap-anywhere text-xs font-bold tracking-widest text-muted uppercase">
          {maintenanceType.name}
        </p>
        <PageTitle highlight="mantenimiento">Editar</PageTitle>
      </div>
      <MaintenanceTypeForm
        vehicleId={vehicle.id}
        typeId={maintenanceType.id}
        metricUnitLabel={vehicle.metricUnit}
        action={updateMaintenanceTypeAction}
        submitLabel="Guardar cambios"
        initial={{
          name: maintenanceType.name,
          intervalValue: maintenanceType.intervalValue,
          intervalCalendarValue: maintenanceType.intervalCalendarValue,
          intervalCalendarUnit: maintenanceType.intervalCalendarUnit,
        }}
      />
    </div>
  );
}
