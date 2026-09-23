import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { listVehiclesForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicles } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsForVehicles } from "@/db/queries/maintenance-logs";
import {
  SUBTYPE_LABELS,
  TYPE_GROUP_LABELS,
  TYPE_LABELS,
  VEHICLE_TYPES,
  type VehicleType,
} from "@/lib/validation/vehicle";
import { formatMetric } from "@/lib/format";
import {
  compareNextDue,
  computeNextDue,
  type NextDue,
  type NextDueStatus,
} from "@/lib/maintenance/next-due";
import { ChipLink } from "@/components/ui/chip-link";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { ListRow } from "@/components/ui/list-row";
import { PageTitle } from "@/components/ui/page-title";
import { StatusDot, type StatusDotTone } from "@/components/ui/status-dot";
import { VehicleTypeIcon } from "@/components/ui/vehicle-type-icon";
import type { MaintenanceLog, MaintenanceType, Vehicle } from "@/db/schema";

const STATUS_DOT_TONE: Record<NextDueStatus, StatusDotTone> = {
  ok: "ok",
  pronto: "warn",
  vencido: "danger",
  sin_registro: "muted",
};

const STATUS_DOT_LABEL: Record<NextDueStatus, string> = {
  ok: "Mantenimientos al día",
  pronto: "Mantenimiento próximo a vencer",
  vencido: "Mantenimiento vencido",
  sin_registro: "Sin registros de mantenimiento",
};

// Worst next-due status across the vehicle's scheduled types, or null when
// the vehicle has no type with an interval configured (nothing to report).
function worstVehicleStatus(
  vehicle: Vehicle,
  types: MaintenanceType[],
  logsByTypeId: Map<string, MaintenanceLog[]>,
): NextDueStatus | null {
  const scheduled = types.filter(
    (t) =>
      t.vehicleId === vehicle.id &&
      (t.intervalValue != null || t.intervalCalendarValue != null),
  );
  if (scheduled.length === 0) return null;

  let worst: NextDue | null = null;
  for (const type of scheduled) {
    const nextDue = computeNextDue({
      maintenanceType: type,
      logs: logsByTypeId.get(type.id) ?? [],
      currentValue: vehicle.currentValue,
    });
    if (!worst || compareNextDue(nextDue, worst) < 0) worst = nextDue;
  }
  return worst ? worst.status : null;
}

// This page reads live, per-user data (Clerk auth + Neon query) on every
// request, so it must not be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { userId } = await auth();

  if (!userId) {
    // The middleware already protects this route, but keep this as a
    // defensive fallback for type-narrowing below.
    return null;
  }

  const { tipo } = await searchParams;
  const activeType = VEHICLE_TYPES.includes(tipo as VehicleType)
    ? (tipo as VehicleType)
    : null;

  const myVehicles = await listVehiclesForUser(userId);

  const vehicleIds = myVehicles.map((v) => v.id);
  const [allTypes, allLogs] = await Promise.all([
    listMaintenanceTypesForVehicles(vehicleIds),
    listMaintenanceLogsForVehicles(vehicleIds),
  ]);

  const logsByTypeId = new Map<string, MaintenanceLog[]>();
  for (const log of allLogs) {
    const bucket = logsByTypeId.get(log.maintenanceTypeId);
    if (bucket) {
      bucket.push(log);
    } else {
      logsByTypeId.set(log.maintenanceTypeId, [log]);
    }
  }

  // Groups in canonical type order, then sorted by fleet size: the types the
  // user actually has come first, empty types sink to the bottom.
  const groups = VEHICLE_TYPES.map((type) => ({
    type,
    vehicles: myVehicles
      .filter((v) => v.type === type)
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
  })).sort((a, b) => b.vehicles.length - a.vehicles.length);

  const emptyTypes = groups
    .filter((g) => g.vehicles.length === 0)
    .map((g) => g.type);

  const visibleGroups = activeType
    ? groups.filter((g) => g.type === activeType)
    : groups.filter((g) => g.vehicles.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <PageTitle highlight="vehículos">Tus</PageTitle>
        <LinkButton
          href="/dashboard/vehiculos/nuevo"
          aria-label="Nuevo vehículo"
        >
          <span className="sm:hidden">Nuevo</span>
          <span className="hidden sm:inline">Nuevo vehículo</span>
        </LinkButton>
      </div>

      {myVehicles.length === 0 ? (
        <EmptyState>
          <p className="text-muted">Todavía no tenés vehículos cargados.</p>
          <LinkButton href="/dashboard/vehiculos/nuevo">
            Cargar mi primer vehículo
          </LinkButton>
        </EmptyState>
      ) : (
        <>
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
            <ChipLink
              href="/dashboard"
              active={!activeType}
              count={myVehicles.length}
            >
              Todos
            </ChipLink>
            {groups.map((group) => (
              <ChipLink
                key={group.type}
                href={`/dashboard?tipo=${group.type}`}
                active={activeType === group.type}
                count={group.vehicles.length}
              >
                {TYPE_GROUP_LABELS[group.type]}
              </ChipLink>
            ))}
          </div>

          {visibleGroups.map((group) => (
            <section key={group.type} className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
                {TYPE_GROUP_LABELS[group.type]}
              </h2>
              {group.vehicles.length === 0 ? (
                <EmptyState>
                  <p className="text-sm text-muted">
                    No tenés {TYPE_GROUP_LABELS[group.type].toLowerCase()}{" "}
                    cargados.
                  </p>
                  <LinkButton href="/dashboard/vehiculos/nuevo" size="md">
                    Cargar {TYPE_LABELS[group.type].toLowerCase()}
                  </LinkButton>
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {group.vehicles.map((vehicle) => {
                    const status = worstVehicleStatus(
                      vehicle,
                      allTypes,
                      logsByTypeId,
                    );
                    return (
                      <li key={vehicle.id}>
                        <ListRow
                          href={`/dashboard/vehiculos/${vehicle.id}`}
                          leading={
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:text-primary">
                              <VehicleTypeIcon
                                type={vehicle.type}
                                className="size-5"
                              />
                            </span>
                          }
                          title={vehicle.name}
                          meta={`${vehicle.subtype ? `${SUBTYPE_LABELS[vehicle.subtype]} · ` : ""}${formatMetric(vehicle.currentValue)} ${vehicle.metricUnit}`}
                          trailing={
                            status ? (
                              <StatusDot
                                tone={STATUS_DOT_TONE[status]}
                                label={STATUS_DOT_LABEL[status]}
                              />
                            ) : null
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}

          {!activeType && emptyTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-dashed border-surface-border px-4 py-3">
              <span className="text-xs font-bold tracking-widest text-muted uppercase">
                Sumá:
              </span>
              {emptyTypes.map((type) => (
                <Link
                  key={type}
                  href="/dashboard/vehiculos/nuevo"
                  className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-primary"
                >
                  {TYPE_LABELS[type]}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
