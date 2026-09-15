import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { VehicleEditForm } from "@/app/dashboard/vehiculos/[vehicleId]/editar/vehicle-edit-form";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]/editar">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href={`/dashboard/vehiculos/${vehicle.id}`}>
        {vehicle.name}
      </BackLink>
      <PageTitle highlight="vehículo">Editar</PageTitle>
      <VehicleEditForm vehicle={vehicle} />
    </div>
  );
}
