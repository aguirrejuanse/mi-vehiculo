import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { MaintenanceLogForm } from "@/app/dashboard/vehiculos/[vehicleId]/registros/nuevo/maintenance-log-form";

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
      <Link
        href={`/dashboard/vehiculos/${vehicle.id}`}
        className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
      >
        ← {vehicle.name}
      </Link>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-widest text-rb-muted uppercase">
          {vehicle.name}
        </p>
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Nuevo <span className="text-rb-red">registro</span>
        </h1>
      </div>

      {maintenanceTypes.length === 0 ? (
        <div className="flex flex-col gap-4 rounded-sm border border-dashed border-surface-border p-6 text-center">
          <p className="text-sm text-rb-muted">
            Todavía no cargaste tipos de mantenimiento para este vehículo.
          </p>
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            className="mx-auto rounded-sm bg-rb-red px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover"
          >
            Cargar mantenimiento
          </Link>
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
