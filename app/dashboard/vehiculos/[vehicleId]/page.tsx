import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getVehicleForUser } from "@/db/queries/vehicles";
import { listMaintenanceTypesForVehicle } from "@/db/queries/maintenance-types";
import { listMaintenanceLogsWithTypeForVehicle } from "@/db/queries/maintenance-logs";
import { listPartsForVehicle } from "@/db/queries/parts";
import { SUBTYPE_LABELS, TYPE_LABELS } from "@/lib/validation/vehicle";
import { formatDateUTC, formatMetric } from "@/lib/format";
import { LocalTime } from "@/components/ui/local-time";
import { BackLink } from "@/components/ui/back-link";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionAddLink, SectionLink } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { VehicleTypeIcon } from "@/components/ui/vehicle-type-icon";
import { PencilIcon } from "@/components/ui/icons";
import {
  computeNextDue,
  compareNextDue,
  NEXT_DUE_STATUS,
  type NextDue,
  type NextDueStatus,
} from "@/lib/maintenance/next-due";
import { nextPartStatus } from "@/lib/validation/part";
import { AdvancePartButton } from "./advance-part-button";
import { ArchiveVehicleButton } from "./archive-vehicle-button";
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
  pendiente_instalar: "Pendiente",
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

const PART_ADVANCE_LABEL: Record<Part["status"], string> = {
  wishlist: "Marcar pendiente",
  pendiente_instalar: "Marcar instalado",
  instalado: "",
};

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: PageProps<"/dashboard/vehiculos/[vehicleId]">) {
  const { vehicleId } = await params;
  const userId = await requireUserId();
  const vehicle = await getVehicleForUser(vehicleId, userId);

  if (!vehicle) notFound();

  const isArchived = vehicle.archivedAt != null;

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

      <Card padding="md" className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <VehicleTypeIcon type={vehicle.type} className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="truncate text-2xl font-black tracking-tight uppercase">
              {vehicle.name}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              {isArchived ? (
                <span className="rounded-full border border-surface-border bg-surface-2 px-2 py-0.5 text-xs font-bold tracking-widest whitespace-nowrap text-muted uppercase">
                  Archivado
                </span>
              ) : (
                <Link
                  href={`/dashboard/vehiculos/${vehicle.id}/editar`}
                  aria-label={`Editar ${vehicle.name}`}
                  className="mt-0.5 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
                >
                  <PencilIcon className="size-4" />
                </Link>
              )}
              <ArchiveVehicleButton
                vehicleId={vehicle.id}
                isArchived={isArchived}
              />
            </div>
          </div>
          <p className="text-sm text-muted">
            {TYPE_LABELS[vehicle.type]}
            {vehicle.subtype ? ` · ${SUBTYPE_LABELS[vehicle.subtype]}` : ""}
          </p>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold tracking-tight">
              {formatMetric(vehicle.currentValue)}
            </span>
            <span className="text-sm text-muted">{vehicle.metricUnit}</span>
          </p>
        </div>
      </Card>

      <Section
        title="Próximos mantenimientos"
        action={
          !isArchived && (
            <SectionAddLink
              href={`/dashboard/vehiculos/${vehicle.id}/mantenimientos/nuevo`}
            >
              Mantenimiento
            </SectionAddLink>
          )
        }
      >
        {nextDueByType.length === 0 ? (
          <EmptyState>
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
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {nextDueByType.map(({ type, nextDue }) => (
              <Card as="li" key={type.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
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
                          ? `Faltan ${formatMetric(Math.round(nextDue.usageRemaining))} ${vehicle.metricUnit}`
                          : `Vencido por ${formatMetric(Math.round(Math.abs(nextDue.usageRemaining)))} ${vehicle.metricUnit}`}
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
      </Section>

      <Section
        title="Repuestos"
        action={
          !isArchived && (
            <SectionAddLink
              href={`/dashboard/vehiculos/${vehicle.id}/repuestos/nuevo`}
            >
              Repuesto
            </SectionAddLink>
          )
        }
      >
        {partsWithLinks.length === 0 ? (
          <EmptyState>
            <p className="text-sm text-muted">
              Todavía no cargaste repuestos para este vehículo.
            </p>
            <LinkButton
              href={`/dashboard/vehiculos/${vehicle.id}/repuestos/nuevo`}
              size="md"
            >
              Cargar repuesto
            </LinkButton>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {partsWithLinks.map(({ part, linkedType, linkedLog }) => (
              <Card as="li" key={part.id} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <p className="font-bold">{part.name}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={PART_STATUS_TONE[part.status]}>
                      {PART_STATUS_LABEL[part.status]}
                    </Badge>
                    {nextPartStatus(part.status) && (
                      <AdvancePartButton
                        partId={part.id}
                        vehicleId={vehicle.id}
                        currentStatus={part.status}
                        label={PART_ADVANCE_LABEL[part.status]}
                      />
                    )}
                  </div>
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
      </Section>

      <Section
        title="Historial"
        action={
          !isArchived && (
            <SectionAddLink
              href={`/dashboard/vehiculos/${vehicle.id}/registros/nuevo`}
            >
              Registro
            </SectionAddLink>
          )
        }
      >
        {logs.length === 0 ? (
          <EmptyState>
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
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {logs.map((log) => (
              <Card as="li" key={log.id} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="font-bold">{log.maintenanceType.name}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted">
                      {formatDateUTC(log.performedAtDate)} ·{" "}
                      <LocalTime value={log.lastEditedAt ?? log.createdAt} />
                    </p>
                    {log.editCount > 0 && (
                      <SectionLink
                        href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/historial`}
                      >
                        Editado ({log.editCount})
                      </SectionLink>
                    )}
                    <SectionLink
                      href={`/dashboard/vehiculos/${vehicle.id}/registros/${log.id}/editar`}
                    >
                      Editar
                    </SectionLink>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {formatMetric(log.performedAtValue)} {vehicle.metricUnit}
                </p>
                {log.notes && (
                  <p className="text-sm text-foreground">{log.notes}</p>
                )}
              </Card>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
