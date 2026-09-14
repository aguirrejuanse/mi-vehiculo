// TODO: build the real "new vehicle" form (name, type, metric unit,
// current value, optional weekly usage rate) backed by a Server Action
// that inserts into `vehicles` scoped to the authenticated Clerk userId.
// Placeholder page for now so /dashboard/vehiculos/nuevo resolves.
export default function NewVehiclePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold">Nuevo vehículo</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Formulario pendiente de implementación.
      </p>
    </div>
  );
}
