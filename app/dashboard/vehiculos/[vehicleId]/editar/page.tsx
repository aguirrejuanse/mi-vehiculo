import { notFound, redirect } from "next/navigation";
import { filterSuffix } from "@/lib/dashboard-filters";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { VehicleEditForm } from "@/app/dashboard/vehiculos/[vehicleId]/editar/vehicle-edit-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
  searchParams,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/editar">) {
  const { vehicleId } = await params;
  const { tipo, ver } = await searchParams;
  const suffix = filterSuffix({ tipo, ver });
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();
  if (vehicle.archivedAt)
    redirect(`/dashboard/vehiculos/${vehicle.id}${suffix}`);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}${suffix}`}>
        Volver
      </BackLink>
      <div className="flex flex-col gap-1">
        <p className="wrap-anywhere text-xs font-bold tracking-widest text-muted uppercase">
          {vehicle.name}
        </p>
        <PageTitle highlight="vehículo">Editar</PageTitle>
      </div>
      <VehicleEditForm vehicle={vehicle} />
    </div>
  );
}
