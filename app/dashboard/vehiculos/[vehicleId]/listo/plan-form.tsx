"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addSuggestedTypesFormAction } from "./actions";
import { CALENDAR_UNIT_LABEL, formatMetric } from "@/lib/format";
import type { SuggestedMaintenance } from "@/lib/maintenance/templates";
import type { ActionState } from "@/lib/validation/action-state";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";

const INITIAL_STATE: ActionState = { status: "idle" };

// "cada 12 h" / "cada 10.000 km · cada 12 meses" / "sin intervalo" — the
// configured cadence, same summary style as intervalSummary on the vehicle
// detail page but compact ("h" instead of "horas").
function intervalSummary(
  item: SuggestedMaintenance,
  metricUnit: "horas" | "km",
): string {
  const parts: string[] = [];
  if (item.intervalValue != null) {
    const unit = metricUnit === "horas" ? "h" : metricUnit;
    parts.push(`cada ${formatMetric(Number(item.intervalValue))} ${unit}`);
  }
  if (
    item.intervalCalendarValue != null &&
    item.intervalCalendarUnit != null
  ) {
    const [singular, plural] = CALENDAR_UNIT_LABEL[item.intervalCalendarUnit];
    parts.push(
      `cada ${item.intervalCalendarValue} ${
        item.intervalCalendarValue === 1 ? singular : plural
      }`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "sin intervalo";
}

type SuggestedPlanFormProps = {
  vehicleId: string;
  metricUnit: "horas" | "km";
  suggestions: SuggestedMaintenance[];
};

export function SuggestedPlanForm({
  vehicleId,
  metricUnit,
  suggestions,
}: SuggestedPlanFormProps) {
  const [state, formAction, isPending] = useActionState(
    addSuggestedTypesFormAction,
    INITIAL_STATE,
  );

  // All rows start checked: the plan is opt-out. Checked keys are submitted
  // as repeated `suggested` values — names/intervals never leave the server.
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => new Set(suggestions.map((item) => item.key)),
  );

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const count = checked.size;
  const submitLabel =
    count === 0
      ? "Elegí al menos uno"
      : count === 1
        ? "Agregar 1 mantenimiento"
        : `Agregar ${count} mantenimientos`;

  return (
    <Card
      as="form"
      action={formAction}
      noValidate
      padding="md"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <ul className="flex flex-col divide-y divide-surface-border">
        {suggestions.map((item) => (
          <li key={item.key} className="py-3 first:pt-0 last:pb-0">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="suggested"
                value={item.key}
                checked={checked.has(item.key)}
                onChange={() => toggle(item.key)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border border-surface-border bg-surface-2 outline-none transition-colors focus:border-primary"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {item.name}
                </span>
                <span className="text-xs text-muted">
                  {intervalSummary(item, metricUnit)}
                  {item.note ? ` · ${item.note}` : ""}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <FieldError
        message={state.status === "error" ? state.message : undefined}
      />

      <div className="flex flex-col items-center gap-3">
        <SubmitButton
          isPending={isPending}
          label={submitLabel}
          pendingLabel="Guardando..."
          disabled={count === 0}
        />
        <Link
          href={`/dashboard/vehiculos/${vehicleId}`}
          className="text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
        >
          Ahora no
        </Link>
      </div>
    </Card>
  );
}
