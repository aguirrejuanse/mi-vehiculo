import type { MaintenanceLog, MaintenanceType } from "@/db/schema";

// Below this remaining ratio (of the total interval), status becomes
// "pronto". Threshold is inclusive: exactly 20% remaining counts as "pronto".
export const DUE_SOON_RATIO = 0.2;

export const NEXT_DUE_STATUS = {
  SIN_REGISTRO: "sin_registro",
  OK: "ok",
  PRONTO: "pronto",
  VENCIDO: "vencido",
} as const;

export type NextDueStatus =
  (typeof NEXT_DUE_STATUS)[keyof typeof NEXT_DUE_STATUS];

export type NextDueTrigger = "uso" | "calendario" | null;

export interface NextDueInput {
  maintenanceType: Pick<
    MaintenanceType,
    "intervalValue" | "intervalCalendarValue" | "intervalCalendarUnit"
  >;
  // Logs for THIS maintenanceType only, order does not matter.
  logs: Pick<MaintenanceLog, "performedAtValue" | "performedAtDate">[];
  currentValue: string;
  // Injectable "now" for manual verification — defaults to `new Date()`.
  now?: Date;
}

export interface NextDue {
  status: NextDueStatus;
  // Which threshold governs the reported status (the one due soonest).
  trigger: NextDueTrigger;
  usageDue: number | null;
  usageRemaining: number | null;
  dateDue: Date | null;
  daysRemaining: number | null;
  lastLogValue: number | null;
  lastLogDate: Date | null;
}

const DAY_MS = 86_400_000;

// UTC-only date arithmetic. Never use local getters (getDate/getMonth/
// setMonth) here — date-only values travel as UTC midnight throughout this
// app (see lib/format.ts), and local getters shift the day in
// negative-UTC-offset timezones like Argentina's.
function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function addMonthsUtc(ms: number, months: number): number {
  const d = new Date(ms);
  const total = d.getUTCMonth() + months;
  const y = d.getUTCFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  // Day 0 of month m+1 is the last day of month m — gives us the clamp target.
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay));
}

function addDaysUtc(ms: number, days: number): number {
  return ms + days * DAY_MS;
}

interface ThresholdResult {
  status: NextDueStatus;
  ratio: number;
}

function classify(remaining: number, interval: number): ThresholdResult {
  if (remaining <= 0) {
    return { status: NEXT_DUE_STATUS.VENCIDO, ratio: remaining / interval };
  }
  const ratio = remaining / interval;
  if (ratio <= DUE_SOON_RATIO) {
    return { status: NEXT_DUE_STATUS.PRONTO, ratio };
  }
  return { status: NEXT_DUE_STATUS.OK, ratio };
}

// Severity order used to pick the winning trigger when both are set, and by
// compareNextDue for sorting: lower index = more urgent.
const SEVERITY_ORDER: NextDueStatus[] = [
  NEXT_DUE_STATUS.VENCIDO,
  NEXT_DUE_STATUS.PRONTO,
  NEXT_DUE_STATUS.OK,
  NEXT_DUE_STATUS.SIN_REGISTRO,
];

export function computeNextDue(input: NextDueInput): NextDue {
  const { maintenanceType, logs, currentValue, now = new Date() } = input;

  const empty: NextDue = {
    status: NEXT_DUE_STATUS.SIN_REGISTRO,
    trigger: null,
    usageDue: null,
    usageRemaining: null,
    dateDue: null,
    daysRemaining: null,
    lastLogValue: null,
    lastLogDate: null,
  };

  if (logs.length === 0) return empty;

  // Last log = max performedAtDate; ties are not distinguishable further
  // since these are only Pick<performedAtValue, performedAtDate> (no
  // createdAt available on the input shape) — max performedAtDate is the
  // stable choice given the contract.
  let last = logs[0];
  for (const log of logs) {
    if (
      new Date(log.performedAtDate).getTime() >
      new Date(last.performedAtDate).getTime()
    ) {
      last = log;
    }
  }

  const lastLogValue = Number(last.performedAtValue);
  const lastLogDate = new Date(utcDayStart(new Date(last.performedAtDate)));
  const nowStart = utcDayStart(now);

  let usageResult: (ThresholdResult & { usageDue: number; usageRemaining: number }) | null =
    null;
  if (maintenanceType.intervalValue != null) {
    const intervalValue = Number(maintenanceType.intervalValue);
    const usageDue = lastLogValue + intervalValue;
    const usageRemaining = usageDue - Number(currentValue);
    const classified = classify(usageRemaining, intervalValue);
    usageResult = { ...classified, usageDue, usageRemaining };
  }

  let calendarResult:
    | (ThresholdResult & { dateDue: Date; daysRemaining: number })
    | null = null;
  if (
    maintenanceType.intervalCalendarValue != null &&
    maintenanceType.intervalCalendarUnit != null
  ) {
    const lastMs = lastLogDate.getTime();
    const dueMs =
      maintenanceType.intervalCalendarUnit === "meses"
        ? addMonthsUtc(lastMs, maintenanceType.intervalCalendarValue)
        : addDaysUtc(lastMs, maintenanceType.intervalCalendarValue);
    const spanDays = (dueMs - lastMs) / DAY_MS;
    const daysRemaining = (dueMs - nowStart) / DAY_MS;
    const classified = classify(daysRemaining, spanDays);
    calendarResult = { ...classified, dateDue: new Date(dueMs), daysRemaining };
  }

  if (!usageResult && !calendarResult) {
    // Should not happen given validation (at least one interval required),
    // but keep it safe/pure rather than throwing.
    return {
      ...empty,
      status: NEXT_DUE_STATUS.SIN_REGISTRO,
      lastLogValue,
      lastLogDate,
    };
  }

  let trigger: NextDueTrigger;
  let status: NextDueStatus;

  if (usageResult && calendarResult) {
    const usageSeverity = SEVERITY_ORDER.indexOf(usageResult.status);
    const calendarSeverity = SEVERITY_ORDER.indexOf(calendarResult.status);
    if (usageSeverity < calendarSeverity) {
      trigger = "uso";
      status = usageResult.status;
    } else if (calendarSeverity < usageSeverity) {
      trigger = "calendario";
      status = calendarResult.status;
    } else if (usageResult.ratio <= calendarResult.ratio) {
      trigger = "uso";
      status = usageResult.status;
    } else {
      trigger = "calendario";
      status = calendarResult.status;
    }
  } else if (usageResult) {
    trigger = "uso";
    status = usageResult.status;
  } else {
    trigger = "calendario";
    status = calendarResult!.status;
  }

  return {
    status,
    trigger,
    usageDue: usageResult?.usageDue ?? null,
    usageRemaining: usageResult?.usageRemaining ?? null,
    dateDue: calendarResult?.dateDue ?? null,
    daysRemaining: calendarResult?.daysRemaining ?? null,
    lastLogValue,
    lastLogDate,
  };
}

export function compareNextDue(a: NextDue, b: NextDue): number {
  return SEVERITY_ORDER.indexOf(a.status) - SEVERITY_ORDER.indexOf(b.status);
}
