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
import { filterSuffix } from "@/lib/dashboard-filters";
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
import { Section } from "@/components/ui/section";
import { StatusDot, type StatusDotTone } from "@/components/ui/status-dot";
import { VehicleTypeIcon } from "@/components/ui/vehicle-type-icon";
import type { MaintenanceLog, MaintenanceType, Vehicle } from "@/db/schema";

const STATUS_DOT_TONE: Record<NextDueStatus, StatusDotTone> = {
  ok: "ok",
  pronto: "warn",
  vencido: "danger",
  sin_registro: "warn",
};

const STATUS_DOT_LABEL: Record<NextDueStatus, string> = {
  ok: "Mantenimientos al día",
  pronto: "Mantenimiento próximo a vencer",
  vencido: "Mantenimiento vencido",
  sin_registro: "Sin registros de mantenimiento",
};

// Short inline label for the row meta — the dot alone can't be interrogated
// on touch devices (no hover → no title tooltip).
const STATUS_ROW_LABEL: Partial<Record<NextDueStatus, string>> = {
  pronto: "Próximo",
  vencido: "Vencido",
  sin_registro: "Sin registro",
};

const STATUS_ROW_TONE: Partial<Record<NextDueStatus, string>> = {
  pronto: "text-accent",
  vencido: "text-danger",
  sin_registro: "text-accent",
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

// Builds /dashboard URLs keeping the two filter axes independent:
// ?tipo=<type> (group filter) and ?ver=archivados (active vs archived pool).
function dashboardHref(type: VehicleType | null, archived: boolean): string {
  const params = new URLSearchParams();
  if (type) params.set("tipo", type);
  if (archived) params.set("ver", "archivados");
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
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

  const { tipo, ver } = await searchParams;
  const suffix = filterSuffix({ tipo, ver });
  const activeType = VEHICLE_TYPES.includes(tipo as VehicleType)
    ? (tipo as VehicleType)
    : null;
  const showArchived = ver === "archivados";

  // includeArchived=true so the "Archivados" chip can show its count; the
  // visible pool is then filtered to one side of the split.
  const allVehicles = await listVehiclesForUser(userId, true);
  const archivedCount = allVehicles.filter((v) => v.archivedAt != null).length;
  const pool = allVehicles.filter((v) =>
    showArchived ? v.archivedAt != null : v.archivedAt == null,
  );

  // Status dots only make sense for the active pool (an archived vehicle's
  // next-due is frozen) — skip the two batch queries entirely in that view.
  const vehicleIds = pool.map((v) => v.id);
  const [allTypes, allLogs] = !showArchived
    ? await Promise.all([
        listMaintenanceTypesForVehicles(vehicleIds),
        listMaintenanceLogsForVehicles(vehicleIds),
      ])
    : [[], []];

  const logsByTypeId = new Map<string, MaintenanceLog[]>();
  for (const log of allLogs) {
    const bucket = logsByTypeId.get(log.maintenanceTypeId);
    if (bucket) {
      bucket.push(log);
    } else {
      logsByTypeId.set(log.maintenanceTypeId, [log]);
    }
  }

  // Per-vehicle worst status, computed once and reused for sorting + render.
  const statusByVehicleId = new Map<string, NextDueStatus | null>();
  for (const vehicle of pool) {
    statusByVehicleId.set(
      vehicle.id,
      worstVehicleStatus(vehicle, allTypes, logsByTypeId),
    );
  }

  // Urgency first, name breaks ties — an overdue vehicle buried
  // alphabetically at the bottom defeats the point of the status dot.
  const STATUS_RANK: Record<NextDueStatus, number> = {
    vencido: 0,
    pronto: 1,
    sin_registro: 2,
    ok: 3,
  };
  const rankOf = (v: Vehicle) => {
    const s = statusByVehicleId.get(v.id);
    return s == null ? 4 : STATUS_RANK[s];
  };

  // Groups in canonical type order, then sorted by fleet size: the types the
  // user actually has come first, empty types sink to the bottom.
  const groups = VEHICLE_TYPES.map((type) => ({
    type,
    vehicles: pool
      .filter((v) => v.type === type)
      .sort(
        (a, b) => rankOf(a) - rankOf(b) || a.name.localeCompare(b.name, "es"),
      ),
  })).sort((a, b) => b.vehicles.length - a.vehicles.length);

  const emptyTypes = groups
    .filter((g) => g.vehicles.length === 0)
    .map((g) => g.type);

  // An empty pool already shows the global empty state — rendering per-type
  // sections on top of it would stack two empty states saying the same thing.
  const visibleGroups =
    pool.length === 0
      ? []
      : activeType
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

      {allVehicles.length === 0 ? (
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
              href={dashboardHref(null, showArchived)}
              active={!activeType}
              count={pool.length}
            >
              Todos
            </ChipLink>
            {groups.map((group) => (
              <ChipLink
                key={group.type}
                href={dashboardHref(group.type, showArchived)}
                active={activeType === group.type}
                count={group.vehicles.length}
              >
                {TYPE_GROUP_LABELS[group.type]}
              </ChipLink>
            ))}
          </div>

          {(archivedCount > 0 || showArchived) && (
            <Link
              href={dashboardHref(activeType, !showArchived)}
              className="self-end text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
            >
              {showArchived
                ? `← Ver activos`
                : `Ver archivados (${archivedCount})`}
            </Link>
          )}

          {pool.length === 0 && (
            <EmptyState>
              <p className="text-sm text-muted">
                {showArchived
                  ? "No tenés vehículos archivados."
                  : "No tenés vehículos activos."}
              </p>
              {!showArchived && (
                <LinkButton href="/dashboard/vehiculos/nuevo" size="md">
                  Cargar vehículo
                </LinkButton>
              )}
            </EmptyState>
          )}

          {visibleGroups.map((group) => (
            <Section key={group.type} title={TYPE_GROUP_LABELS[group.type]}>
              {group.vehicles.length === 0 ? (
                <EmptyState>
                  <p className="text-sm text-muted">
                    No tenés {TYPE_GROUP_LABELS[group.type].toLowerCase()}{" "}
                    {showArchived ? "archivados" : "cargados"}.
                  </p>
                  {!showArchived && (
                    <LinkButton href="/dashboard/vehiculos/nuevo" size="md">
                      Cargar {TYPE_LABELS[group.type].toLowerCase()}
                    </LinkButton>
                  )}
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {group.vehicles.map((vehicle) => {
                    const status = statusByVehicleId.get(vehicle.id) ?? null;
                    return (
                      <li key={vehicle.id}>
                        <ListRow
                          href={`/dashboard/vehiculos/${vehicle.id}${suffix}`}
                          leading={
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:text-primary">
                              <VehicleTypeIcon
                                type={vehicle.type}
                                className="size-5"
                              />
                            </span>
                          }
                          title={vehicle.name}
                          meta={
                            <>
                              {vehicle.subtype
                                ? `${SUBTYPE_LABELS[vehicle.subtype]} · `
                                : ""}
                              {formatMetric(vehicle.currentValue)}{" "}
                              {vehicle.metricUnit}
                              {status && STATUS_ROW_LABEL[status] && (
                                <span
                                  className={`font-semibold ${STATUS_ROW_TONE[status]}`}
                                >
                                  {" "}
                                  · {STATUS_ROW_LABEL[status]}
                                </span>
                              )}
                            </>
                          }
                          trailing={
                            showArchived ? (
                              <span className="shrink-0 rounded-full border border-surface-border px-2 py-0.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-muted uppercase">
                                Archivado
                              </span>
                            ) : status ? (
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
            </Section>
          ))}

          {!activeType && !showArchived && emptyTypes.length > 0 && (
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
