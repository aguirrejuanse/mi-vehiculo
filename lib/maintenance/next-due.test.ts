import { describe, expect, it } from "vitest";
import {
  DUE_SOON_RATIO,
  NEXT_DUE_STATUS,
  compareNextDue,
  computeNextDue,
  type NextDueInput,
} from "@/lib/maintenance/next-due";

// UTC-only fixture helper — mirrors how performedAtDate/`now` round-trip in
// the app (see lib/format.ts gotcha): always build dates via Date.UTC so
// tests behave the same in any TZ (CI, Argentina, wherever).
function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function baseType(overrides: Partial<NextDueInput["maintenanceType"]> = {}) {
  return {
    intervalValue: null,
    intervalCalendarValue: null,
    intervalCalendarUnit: null,
    ...overrides,
  };
}

describe("computeNextDue", () => {
  it("returns sin_registro when there are no logs, regardless of interval config", () => {
    const result = computeNextDue({
      maintenanceType: baseType({ intervalValue: "3000" }),
      logs: [],
      currentValue: "1000",
      now: utc(2026, 1, 1),
    });

    expect(result.status).toBe(NEXT_DUE_STATUS.SIN_REGISTRO);
    expect(result.trigger).toBeNull();
    expect(result.lastLogValue).toBeNull();
    expect(result.lastLogDate).toBeNull();
  });

  describe("usage-only interval", () => {
    it("is ok when well below the pronto threshold", () => {
      // due at 4000, current 1000 -> 3000 remaining / 3000 interval = 100%
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "3000" }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "1000",
        now: utc(2026, 1, 1),
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.OK);
      expect(result.trigger).toBe("uso");
      expect(result.usageDue).toBe(4000);
      expect(result.usageRemaining).toBe(3000);
    });

    it("is pronto once remaining ratio drops to exactly the 20% threshold (inclusive)", () => {
      // due at 4000, remaining must be exactly 600 (20% of 3000) -> current 3400
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "3000" }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "3400",
        now: utc(2026, 1, 1),
      });

      expect(result.usageRemaining).toBe(600);
      expect(result.usageRemaining! / 3000).toBe(DUE_SOON_RATIO);
      expect(result.status).toBe(NEXT_DUE_STATUS.PRONTO);
      expect(result.trigger).toBe("uso");
    });

    it("is pronto just above zero remaining", () => {
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "3000" }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "3999",
        now: utc(2026, 1, 1),
      });

      expect(result.usageRemaining).toBe(1);
      expect(result.status).toBe(NEXT_DUE_STATUS.PRONTO);
    });

    it("is vencido once current value reaches the due value", () => {
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "3000" }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "4000",
        now: utc(2026, 1, 1),
      });

      expect(result.usageRemaining).toBe(0);
      expect(result.status).toBe(NEXT_DUE_STATUS.VENCIDO);
      expect(result.trigger).toBe("uso");
    });

    it("is vencido when current value has gone past the due value", () => {
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "3000" }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "5500",
        now: utc(2026, 1, 1),
      });

      expect(result.usageRemaining).toBe(-1500);
      expect(result.status).toBe(NEXT_DUE_STATUS.VENCIDO);
    });
  });

  describe("calendar-only interval", () => {
    it("is ok when far from the due date (unit: meses)", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 6,
          intervalCalendarUnit: "meses",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "0",
        now: utc(2026, 1, 15),
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.OK);
      expect(result.trigger).toBe("calendario");
      expect(result.dateDue).toEqual(utc(2026, 7, 1));
    });

    it("is pronto within the 20% window (unit: dias)", () => {
      // 30-day interval, due 2026-01-31, "now" at day 25 -> 6 days remaining (20% of 30)
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 30,
          intervalCalendarUnit: "dias",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "0",
        now: utc(2026, 1, 25),
      });

      expect(result.daysRemaining).toBe(6);
      expect(result.status).toBe(NEXT_DUE_STATUS.PRONTO);
      expect(result.trigger).toBe("calendario");
    });

    it("is vencido once the due date has passed", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 30,
          intervalCalendarUnit: "dias",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "0",
        now: utc(2026, 2, 5),
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.VENCIDO);
      expect(result.trigger).toBe("calendario");
    });

    it("clamps end-of-month overflow: 31 Jan + 1 month -> 28 Feb (non-leap year)", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 1,
          intervalCalendarUnit: "meses",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 31) }],
        currentValue: "0",
        now: utc(2026, 1, 31),
      });

      expect(result.dateDue).toEqual(utc(2026, 2, 28));
    });

    it("clamps end-of-month overflow into a leap-year February: 31 Jan 2028 + 1 month -> 29 Feb", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 1,
          intervalCalendarUnit: "meses",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2028, 1, 31) }],
        currentValue: "0",
        now: utc(2028, 1, 31),
      });

      expect(result.dateDue).toEqual(utc(2028, 2, 29));
    });

    it("carries a non-clamped day forward normally across a month boundary", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalCalendarValue: 1,
          intervalCalendarUnit: "meses",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 15) }],
        currentValue: "0",
        now: utc(2026, 1, 15),
      });

      expect(result.dateDue).toEqual(utc(2026, 2, 15));
    });
  });

  describe("both intervals set", () => {
    it("usage wins when it is strictly more urgent (vencido vs ok)", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalValue: "3000",
          intervalCalendarValue: 12,
          intervalCalendarUnit: "meses",
        }),
        logs: [{ performedAtValue: "1000", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "4000", // usage: vencido
        now: utc(2026, 1, 2), // calendar: far from due, ok
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.VENCIDO);
      expect(result.trigger).toBe("uso");
    });

    it("calendar wins when it is strictly more urgent (vencido vs ok)", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalValue: "10000",
          intervalCalendarValue: 30,
          intervalCalendarUnit: "dias",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "100", // usage: barely used, ok
        now: utc(2026, 2, 5), // calendar: past due
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.VENCIDO);
      expect(result.trigger).toBe("calendario");
    });

    it("breaks a same-severity tie by picking the lower (more urgent) ratio", () => {
      // Both intervals land in "pronto" (ratio <= 0.2). Usage ratio 0.1 (more
      // urgent) vs calendar ratio 0.2 -> usage should win the tie.
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalValue: "1000", // due at 1000, remaining 100 -> ratio 0.1
          intervalCalendarValue: 30, // due day 30, 6 days remaining -> ratio 0.2
          intervalCalendarUnit: "dias",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "900",
        now: utc(2026, 1, 25),
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.PRONTO);
      expect(result.trigger).toBe("uso");
    });

    it("breaks a same-severity tie the other way when calendar ratio is lower", () => {
      const result = computeNextDue({
        maintenanceType: baseType({
          intervalValue: "1000", // remaining 200 -> ratio 0.2
          intervalCalendarValue: 30, // 3 days remaining -> ratio 0.1
          intervalCalendarUnit: "dias",
        }),
        logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
        currentValue: "800",
        now: utc(2026, 1, 28),
      });

      expect(result.status).toBe(NEXT_DUE_STATUS.PRONTO);
      expect(result.trigger).toBe("calendario");
    });
  });

  describe("multiple logs", () => {
    it("uses the log with the latest performedAtDate as the baseline", () => {
      const result = computeNextDue({
        maintenanceType: baseType({ intervalValue: "1000" }),
        logs: [
          { performedAtValue: "500", performedAtDate: utc(2026, 1, 1) },
          { performedAtValue: "2000", performedAtDate: utc(2026, 3, 1) }, // latest
          { performedAtValue: "1200", performedAtDate: utc(2026, 2, 1) },
        ],
        currentValue: "2000",
        now: utc(2026, 3, 2),
      });

      expect(result.lastLogValue).toBe(2000);
      expect(result.lastLogDate).toEqual(utc(2026, 3, 1));
      expect(result.usageDue).toBe(3000); // 2000 + 1000, not the earlier logs
    });
  });
});

describe("compareNextDue", () => {
  it("orders vencido before pronto before ok before sin_registro", () => {
    const vencido = computeNextDue({
      maintenanceType: baseType({ intervalValue: "1000" }),
      logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
      currentValue: "1000",
      now: utc(2026, 1, 1),
    });
    const pronto = computeNextDue({
      maintenanceType: baseType({ intervalValue: "1000" }),
      logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
      currentValue: "850",
      now: utc(2026, 1, 1),
    });
    const ok = computeNextDue({
      maintenanceType: baseType({ intervalValue: "1000" }),
      logs: [{ performedAtValue: "0", performedAtDate: utc(2026, 1, 1) }],
      currentValue: "100",
      now: utc(2026, 1, 1),
    });
    const sinRegistro = computeNextDue({
      maintenanceType: baseType({ intervalValue: "1000" }),
      logs: [],
      currentValue: "0",
      now: utc(2026, 1, 1),
    });

    const sorted = [sinRegistro, ok, vencido, pronto].sort(compareNextDue);

    expect(sorted.map((r) => r.status)).toEqual([
      NEXT_DUE_STATUS.VENCIDO,
      NEXT_DUE_STATUS.PRONTO,
      NEXT_DUE_STATUS.OK,
      NEXT_DUE_STATUS.SIN_REGISTRO,
    ]);
  });
});
