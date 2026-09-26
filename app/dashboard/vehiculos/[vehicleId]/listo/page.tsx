import { notFound, redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { getSuggestedMaintenances } from "@/lib/maintenance/templates";
import { PageTitle } from "@/components/ui/page-title";
import { SuggestedPlanForm } from "./plan-form";

export const dynamic = "force-dynamic";

export default async function SuggestedPlanPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/listo">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  // This is a post-creation interstitial, not a destination: archived
  // vehicles and type/subtype combos the catalog doesn't cover skip it.
  if (vehicle.archivedAt) redirect(`/dashboard/vehiculos/${vehicle.id}`);

  // One-shot interstitial: a vehicle that already has types (plan applied,
  // or anything added manually) has no business here — resubmitting would
  // only ever produce duplicates.
  const existing = await listMaintenanceTypesForVehicle(vehicle.id);
  if (existing.length > 0) {
    redirect(`/dashboard/vehiculos/${vehicle.id}`);
  }

  const suggestions = getSuggestedMaintenances(
    vehicle.type,
    vehicle.subtype,
    vehicle.metricUnit,
  );
  if (suggestions.length === 0) {
    redirect(`/dashboard/vehiculos/${vehicle.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <p className="wrap-anywhere text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="listo">Tu vehículo está</PageTitle>
        <p className="text-sm text-muted">
          Te armamos un plan de mantenimiento sugerido. Elegí cuáles querés
          seguir — después podés editarlos o sumar otros.
        </p>
      </div>
      <SuggestedPlanForm
        vehicleId={vehicle.id}
        metricUnit={vehicle.metricUnit}
        suggestions={suggestions}
      />
    </div>
  );
}
