import { VehicleWizard } from "@/app/nuevo/vehicle-wizard";
import { BackLink } from "@/components/ui/back-link";
import { PageTitle } from "@/components/ui/page-title";
import { parseVehicleTypeParam } from "@/lib/validation/vehicle";

export default async function NewVehiclePage({
  searchParams,
}: PageProps<"/dashboard/vehiculos/nuevo">) {
  const { tipo } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <BackLink href="/dashboard">Tus vehículos</BackLink>
      <PageTitle highlight="vehículo">Nuevo</PageTitle>
      <VehicleWizard initialType={parseVehicleTypeParam(tipo)} />
    </div>
  );
}
