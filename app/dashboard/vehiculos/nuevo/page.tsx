import Link from "next/link";
import { VehicleForm } from "@/app/dashboard/vehiculos/nuevo/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <Link
        href="/dashboard"
        className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
      >
        ← Tus vehículos
      </Link>
      <h1 className="text-2xl font-black tracking-tight uppercase">
        Nuevo <span className="text-rb-red">vehículo</span>
      </h1>
      <VehicleForm />
    </div>
  );
}
