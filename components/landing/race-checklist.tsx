"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RACE_CHECKLIST } from "@/lib/landing/race-checklist";

const STORAGE_KEY = "mv:transmontana-checklist";

const KNOWN_KEYS = new Set(
  RACE_CHECKLIST.flatMap((group) => group.items.map((item) => item.key)),
);
const TOTAL = KNOWN_KEYS.size;

// Stored as a bare array of checked keys: compact, and items added to
// RACE_CHECKLIST later simply start unchecked. Unknown keys from an older
// list are dropped on read rather than resurrected.
function readStoredKeys(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter(
        (key): key is string => typeof key === "string" && KNOWN_KEYS.has(key),
      ),
    );
  } catch {
    return new Set();
  }
}

export function RaceChecklist() {
  // Starts empty on server AND first client render (a localStorage-seeded
  // initial state would be a hydration mismatch); the persisted keys hydrate
  // in the effect below.
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    // queueMicrotask like top-loader.tsx: a synchronous setState inside an
    // effect body is flagged by react-hooks/set-state-in-effect as a
    // cascading render.
    queueMicrotask(() => setChecked(readStoredKeys()));
  }, []);

  function toggle(key: string, next: boolean) {
    const updated = new Set(checked);
    if (next) {
      updated.add(key);
    } else {
      updated.delete(key);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
    } catch {
      // Storage unavailable/quota — the list still works for the session.
    }
    setChecked(updated);
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same as above — clearing state is enough.
    }
    setChecked(new Set());
  }

  const doneCount = checked.size;
  const percent = Math.round((doneCount / TOTAL) * 100);

  return (
    <Card padding="md" className="flex flex-col gap-6">
      {/* Same progress-bar vocabulary as WizardProgress (wizard-progress.tsx):
          uppercase muted count + thin surface-2 track + primary fill. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span
            id="checklist-progress-label"
            className="text-xs font-bold tracking-widest text-muted uppercase"
          >
            {doneCount} de {TOTAL} listos
          </span>
          <button
            type="button"
            onClick={reset}
            disabled={doneCount === 0}
            className="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold tracking-widest text-muted uppercase transition-colors duration-[var(--duration-quick)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reiniciar
          </button>
        </div>
        <div
          role="progressbar"
          aria-labelledby="checklist-progress-label"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-[var(--duration-very-slow)] ease-[var(--ease-smooth-out)] motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {RACE_CHECKLIST.map((group, groupIndex) => (
        <section
          key={group.title}
          aria-labelledby={`checklist-group-${groupIndex}`}
          className="flex flex-col gap-1"
        >
          <h3
            id={`checklist-group-${groupIndex}`}
            className="text-sm font-bold tracking-widest text-muted uppercase"
          >
            {group.title}
          </h3>
          {/* Row pattern mirrors plan-form.tsx: label wraps input + text so
              the whole row toggles, rows separated by divide-y. */}
          <ul className="flex flex-col divide-y divide-surface-border">
            {group.items.map((item) => {
              const isChecked = checked.has(item.key);
              return (
                <li key={item.key}>
                  <label className="flex cursor-pointer items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) =>
                        toggle(item.key, event.target.checked)
                      }
                      className="size-4 shrink-0 accent-primary"
                    />
                    <span
                      className={`text-sm transition-colors duration-[var(--duration-quick)] motion-reduce:transition-none ${
                        isChecked ? "text-muted line-through" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-xs text-muted">
        Tu progreso se guarda solo en este navegador — no hace falta cuenta.
      </p>
    </Card>
  );
}
