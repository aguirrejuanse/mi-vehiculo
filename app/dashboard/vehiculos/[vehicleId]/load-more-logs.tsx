"use client";

import { useState, useTransition } from "react";
import { loadMoreMaintenanceLogsAction } from "./actions";
import { LogCard } from "./log-card";
import type { MaintenanceLogWithTypeAndEditCount } from "@/db/queries/maintenance-logs";

type LoadMoreLogsProps = {
  vehicleId: string;
  metricUnit: string;
  suffix: string;
  isArchived: boolean;
  initialOffset: number;
};

// "Cargar más" appends the next page under the already-rendered logs.
// startTransition keeps the button responsive; a second click while pending
// is blocked by disabled.
export function LoadMoreLogs({
  vehicleId,
  metricUnit,
  suffix,
  isArchived,
  initialOffset,
}: LoadMoreLogsProps) {
  const [extraLogs, setExtraLogs] = useState<
    MaintenanceLogWithTypeAndEditCount[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    setError(false);
    startTransition(async () => {
      try {
        const result = await loadMoreMaintenanceLogsAction(
          vehicleId,
          initialOffset + extraLogs.length,
        );
        setExtraLogs((prev) => [...prev, ...result.logs]);
        setHasMore(result.hasMore);
      } catch {
        setError(true);
      }
    });
  }

  return (
    <>
      {extraLogs.map((log) => (
        <LogCard
          key={log.id}
          log={log}
          vehicleId={vehicleId}
          metricUnit={metricUnit}
          suffix={suffix}
          isArchived={isArchived}
        />
      ))}
      {(hasMore || error) && (
        <li className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="cursor-pointer rounded-full border border-surface-border px-4 py-2 text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Cargando..." : "Cargar más"}
          </button>
          {error && (
            <p className="text-xs text-muted">
              No se pudo cargar. Probá de nuevo.
            </p>
          )}
        </li>
      )}
    </>
  );
}
