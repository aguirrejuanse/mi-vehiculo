import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { VehicleEditForm } from "@/app/dashboard/vehiculos/[vehicleId]/editar/vehicle-edit-form";

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
      <Link
        href={`/dashboard/vehiculos/${vehicle.id}`}
        className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
      >
        ← {vehicle.name}
      </Link>
      <h1 className="text-2xl font-black tracking-tight uppercase">
        Editar <span className="text-rb-red">vehículo</span>
      </h1>
      <VehicleEditForm vehicle={vehicle} />
    </div>
  );
}
