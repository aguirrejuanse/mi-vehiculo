import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { listPartsForVehicle } from "@/db/queries/parts";
import { SUBTYPE_LABELS } from "@/lib/validation/vehicle";
import { formatDateUTC } from "@/lib/format";
import { LocalTime } from "@/components/ui/local-time";
import { BackLink } from "@/components/ui/back-link";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  computeNextDue,
  compareNextDue,
  NEXT_DUE_STATUS,
  type NextDue,
  type NextDueStatus,
} from "@/lib/maintenance/next-due";
import type { MaintenanceType, Part } from "@/db/schema";

const STATUS_LABEL: Record<NextDueStatus, string> = {
  [NEXT_DUE_STATUS.OK]: "Al día",
  [NEXT_DUE_STATUS.PRONTO]: "Pronto",
  [NEXT_DUE_STATUS.VENCIDO]: "Vencido",
  [NEXT_DUE_STATUS.SIN_REGISTRO]: "Sin registro",
};

const STATUS_TONE: Record<NextDueStatus, "ok" | "warn" | "danger" | "muted"> = {
  [NEXT_DUE_STATUS.OK]: "ok",
  [NEXT_DUE_STATUS.PRONTO]: "warn",
  [NEXT_DUE_STATUS.VENCIDO]: "danger",
  [NEXT_DUE_STATUS.SIN_REGISTRO]: "muted",
};

// A maintenanceType with no interval configured (opted out via the
// "sin intervalo" checkbox) has nothing to compute a next-due date from —
// it's excluded from "Próximos mantenimientos" here, at the page level.
// lib/maintenance/next-due.ts is intentionally left untouched.
function hasInterval(type: MaintenanceType): boolean {
  return type.intervalValue != null || type.intervalCalendarValue != null;
}

const PART_STATUS_LABEL: Record<Part["status"], string> = {
  wishlist: "Wishlist",
  pendiente_instalar: "Pendiente instalar",
  instalado: "Instalado",
};

const PART_STATUS_TONE: Record<Part["status"], "ok" | "warn" | "muted"> = {
  wishlist: "muted",
  pendiente_instalar: "warn",
  instalado: "ok",
};

// pendiente_instalar first (most actionable) → wishlist → instalado last
// (archived). Ties broken by createdAt desc (newest first).
const PART_STATUS_ORDER: Record<Part["status"], number> = {
  pendiente_instalar: 0,
  wishlist: 1,
  instalado: 2,
};

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const [maintenanceTypes, logs, parts] = await Promise.all([
    listMaintenanceTypesForVehicle(vehicle.id),
    listMaintenanceLogsWithTypeForVehicle(vehicle.id),
    listPartsForVehicle(vehicle.id),
  ]);

  const logsByTypeId = new Map<string, typeof logs>();
  for (const log of logs) {
    const bucket = logsByTypeId.get(log.maintenanceTypeId);
    if (bucket) {
      bucket.push(log);
    } else {
      logsByTypeId.set(log.maintenanceTypeId, [log]);
    }
  }

  const scheduledTypes = maintenanceTypes.filter(hasInterval);

  const nextDueByType: { type: MaintenanceType; nextDue: NextDue }[] =
    scheduledTypes
      .map((type) => ({
        type,
        nextDue: computeNextDue({
          maintenanceType: type,
          logs: logsByTypeId.get(type.id) ?? [],
          currentValue: vehicle.currentValue,
        }),
      }))
      .sort((a, b) => compareNextDue(a.nextDue, b.nextDue));

  // Parts link forward to a maintenanceType or backward to a maintenanceLog,
  // never both. Both target sets belong to this same vehicle and are already
  // in memory — the join is done here to avoid a round-trip and any
  // `with:` relation query (same strategy as logsByTypeId above).
  const typeById = new Map(maintenanceTypes.map((type) => [type.id, type]));
  const logById = new Map(logs.map((log) => [log.id, log]));

  const partsWithLinks = parts
    .map((part) => ({
      part,
      linkedType: part.maintenanceTypeId
        ? (typeById.get(part.maintenanceTypeId) ?? null)
        : null,
      linkedLog: part.maintenanceLogId
        ? (logById.get(part.maintenanceLogId) ?? null)
        : null,
    }))
    .sort((a, b) => {
      const statusDiff =
        PART_STATUS_ORDER[a.part.status] - PART_STATUS_ORDER[b.part.status];
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(b.part.createdAt).getTime() -
        new Date(a.part.createdAt).getTime()
      );
    });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <BackLink href="/dashboard">Tus vehículos</BackLink>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {vehicle.name}
            </h1>
            <Link
              href={`/dashboard/vehiculos/${vehicle.id}/editar`}
              className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
            >
              Editar
            </Link>
          </div>
          <p className="text-sm text-muted">
            {vehicle.type}
            {vehicle.subtype ? ` · ${SUBTYPE_LABELS[vehicle.subtype]}` : ""} ·{" "}
            {vehicle.currentValue} {vehicle.metricUnit}
          </p>
        </div>
        <div className="flex gap-3 text-xs font-bold tracking-widest uppercase">
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            className="rounded-2xl border border-surface-border px-4 py-2 text-accent transition-colors hover:text-foreground"
          >
            + Mantenimiento
          </Link>
          <LinkButton
            href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
            bare
          >
            + Registro
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
          Próximos mantenimientos
        </h2>

        {nextDueByType.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border py-16 text-center">
            {maintenanceTypes.length === 0 ? (
              <>
                <p className="text-sm text-muted">
                  Todavía no cargaste mantenimientos para este vehículo.
                </p>
                <LinkButton
                  href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
                  size="md"
                >
                  Cargar mantenimiento
                </LinkButton>
              </>
            ) : (
              <p className="text-sm text-muted">
                Tus mantenimientos no tienen intervalo, así que no hay
                vencimientos para calcular.
              </p>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {nextDueByType.map(({ type, nextDue }) => (
              <Card as="li" key={type.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{type.name}</p>
                  <Badge tone={STATUS_TONE[nextDue.status]}>
                    {STATUS_LABEL[nextDue.status]}
                  </Badge>
                </div>

                {nextDue.status === NEXT_DUE_STATUS.SIN_REGISTRO ? (
                  <p className="text-sm text-muted">
                    Cargá un registro para empezar a contar
                  </p>
                ) : (
                  <>
                    {nextDue.usageRemaining != null && (
                      <p
                        className={
                          nextDue.trigger === "uso"
                            ? "text-sm text-foreground"
                            : "text-sm text-muted"
                        }
                      >
                        {nextDue.usageRemaining >= 0
                          ? `Faltan ${Math.round(nextDue.usageRemaining)} ${vehicle.metricUnit}`
                          : `Vencido por ${Math.round(Math.abs(nextDue.usageRemaining))} ${vehicle.metricUnit}`}
                      </p>
                    )}
                    {nextDue.daysRemaining != null && nextDue.dateDue != null && (
                      <p
                        className={
                          nextDue.trigger === "calendario"
                            ? "text-sm text-foreground"
                            : "text-sm text-muted"
                        }
                      >
                        {nextDue.daysRemaining >= 0
                          ? `Faltan ${Math.floor(nextDue.daysRemaining)} días · vence ${formatDateUTC(nextDue.dateDue)}`
                          : `Vencido hace ${Math.abs(Math.floor(nextDue.daysRemaining))} días · venció ${formatDateUTC(nextDue.dateDue)}`}
                      </p>
                    )}
                  </>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
            Repuestos
          </h2>
          <Link
            href={`/dashboard/vehiculos/${vehicle.id}/repuestos/nuevo`}
            className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
          >
            + Repuesto
          </Link>
        </div>

        {partsWithLinks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border py-16 text-center">
            <p className="text-sm text-muted">
              Todavía no cargaste repuestos para este vehículo.
            </p>
            <LinkButton
              href={`/dashboard/vehiculos/${vehicle.id}/repuestos/nuevo`}
              size="md"
            >
              Cargar repuesto
            </LinkButton>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {partsWithLinks.map(({ part, linkedType, linkedLog }) => (
              <Card as="li" key={part.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{part.name}</p>
                  <Badge tone={PART_STATUS_TONE[part.status]}>
                    {PART_STATUS_LABEL[part.status]}
                  </Badge>
                </div>
                {linkedType && (
                  <p className="text-sm text-muted">Para: {linkedType.name}</p>
                )}
                {linkedLog && (
                  <p className="text-sm text-muted">
                    De: {linkedLog.maintenanceType.name} ·{" "}
                    {formatDateUTC(linkedLog.performedAtDate)}
                  </p>
                )}
                {part.notes && (
                  <p className="text-sm text-foreground">{part.notes}</p>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
          Historial
        </h2>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border py-16 text-center">
            <p className="text-sm text-muted">
              Todavía no hay registros de mantenimiento para este vehículo.
            </p>
            {maintenanceTypes.length === 0 ? (
              <LinkButton
                href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
                size="md"
              >
                Cargar mantenimiento
              </LinkButton>
            ) : (
              <LinkButton
                href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
                size="md"
              >
                Cargar registro
              </LinkButton>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {logs.map((log) => (
              <Card as="li" key={log.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{log.maintenanceType.name}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted">
                      {formatDateUTC(log.performedAtDate)} ·{" "}
                      <LocalTime value={log.lastEditedAt ?? log.createdAt} />
                    </p>
                    {log.editCount > 0 && (
                      <Link
                        href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/historial`}
                        className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
                      >
                        Editado ({log.editCount})
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/editar`}
                      className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {log.performedAtValue} {vehicle.metricUnit}
                </p>
                {log.notes && (
                  <p className="text-sm text-foreground">{log.notes}</p>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
