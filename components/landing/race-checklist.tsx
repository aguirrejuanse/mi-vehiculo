"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createVehicleAction } from "@/app/(public)/nuevo/actions";
import {
  GuestAuthStep,
  type ConfirmPhase,
} from "@/app/(public)/nuevo/guest-auth-step";
import {
  ENGINE_LABELS,
  ENGINE_OPTIONS_BY_TYPE,
  validateVehicleFields,
  type VehicleEngine,
  type VehicleInput,
} from "@/lib/validation/vehicle";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { track } from "@/lib/analytics/client";
import { RACE_CHECKLIST } from "@/lib/landing/race-checklist";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { OptionCardGroup } from "@/components/ui/option-card-group";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";

const STORAGE_KEY = "mv:transmontana-checklist";

const KNOWN_KEYS = new Set(
  RACE_CHECKLIST.flatMap((group) => group.items.map((item) => item.key)),
);
const TOTAL = KNOWN_KEYS.size;

// No "No sé" option: same call as the wizard's motor step — at this point
// everyone knows their engine, and an unforced guess would silently drop
// the plan's engine-specific rows.
const ENGINE_OPTIONS: { value: VehicleEngine; label: string }[] =
  ENGINE_OPTIONS_BY_TYPE.moto.map((option) => ({
    value: option as VehicleEngine,
    label: ENGINE_LABELS[option],
  }));

type FieldErrors = Partial<Record<keyof VehicleInput, string>> | null;

// DOM order of the rendered inputs — used to pick the first invalid field
// when scrolling a failed submit back into view.
const FIELD_ORDER: (keyof VehicleInput)[] = [
  "name",
  "engine",
  "currentValue",
];

// The card is long — the checklist sits between the fields and the submit
// button, so failed validation renders its errors at the top, out of view,
// and the submit looks dead. Scroll the first invalid field back into
// view and focus it.
function scrollToFirstError(form: HTMLFormElement, errors: FieldErrors) {
  if (!errors) return;
  const name = FIELD_ORDER.find((field) => errors[field]);
  if (!name) return;
  const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
  // The engine radios are sr-only — their fieldset is the visible target.
  const target = input?.closest("fieldset") ?? input;
  target?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "center",
  });
  input?.focus({ preventScroll: true });
}

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

// The checklist card doubles as the create-moto surface for /transmontana
// (the page has no separate wizard section): a compact fixed moto_enduro
// form — name + engine + horas — leads the card, the checklist follows, and
// "Crear moto" at the bottom dispatches createVehicleAction. Guests get the
// same email+code sub-phase as the wizard's "confirmar" step before the
// dispatch (pendingSave/dispatchedRef pattern — see vehicle-wizard.tsx).
export function RaceChecklist() {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(createVehicleAction, validateVehicleFields);

  const { isLoaded, isSignedIn } = useAuth();

  const formRef = useRef<HTMLFormElement>(null);
  const guestPrimaryActionRef = useRef<(() => void) | null>(null);

  // Starts empty on server AND first client render (a localStorage-seeded
  // initial state would be a hydration mismatch); the persisted keys hydrate
  // in the effect below.
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  // "" means nothing picked yet — the motor pick is required, so the form
  // gates on it like the wizard's motor step.
  const [engine, setEngine] = useState<VehicleEngine | "">("");
  // Client-side errors from our own validation runs (the guest submit path
  // and the engine gate). Server/hook errors arrive via `fieldErrors`.
  const [submitErrors, setSubmitErrors] = useState<FieldErrors>(null);
  const [confirmPhase, setConfirmPhase] = useState<ConfirmPhase>("review");
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    // queueMicrotask like top-loader.tsx: a synchronous setState inside an
    // effect body is flagged by react-hooks/set-state-in-effect as a
    // cascading render.
    queueMicrotask(() => setChecked(readStoredKeys()));
  }, []);

  // Dispatch the vehicle-creation action once the guest's Clerk session is
  // actually active — mirrors the wizard (design D4): `dispatchedRef`
  // guards the double dispatch without a synchronous setState in the
  // effect body. Covers the already-signed-in case too (pendingSave is
  // simply never set there).
  const dispatchedRef = useRef(false);
  useEffect(() => {
    if (!pendingSave || !isSignedIn || dispatchedRef.current) return;
    dispatchedRef.current = true;
    startTransition(() => {
      formAction(new FormData(formRef.current!));
    });
  }, [pendingSave, isSignedIn, formAction]);

  // Schema validation plus the explicit-engine pick: engine is optional in
  // vehicleSchema ("unknown" → null is legitimate) but this form, like the
  // wizard's motor step, demands a choice — otherwise the click-through
  // default silently drops the plan's oil/piston rows.
  function validateForm(formData: FormData): FieldErrors {
    let errors = validateVehicleFields(formData);
    if (formData.get("engine") == null) {
      errors = { ...(errors ?? {}), engine: "Elegí una opción." };
    }
    return errors;
  }

  function errorFor(field: keyof VehicleInput) {
    return submitErrors?.[field] ?? fieldErrors?.[field];
  }

  // Server-returned field errors land out of view just like client-side
  // ones — when the action answers with fieldErrors, scroll to the first.
  const serverFieldErrors = state.status === "error" ? state.fieldErrors : null;
  useEffect(() => {
    const form = formRef.current;
    if (form && serverFieldErrors) scrollToFirstError(form, serverFieldErrors);
  }, [serverFieldErrors]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateForm(new FormData(event.currentTarget));
    if (errors) {
      event.preventDefault();
      setSubmitErrors(errors);
      scrollToFirstError(event.currentTarget, errors);
      return;
    }
    setSubmitErrors(null);
    track("wizard_started", {
      source: "transmontana",
      checklist_done: checked.size,
    });
    handleSubmit(event);
  }

  // Guests don't submit — a valid form swaps the button area for the
  // email+code phase; the dispatch happens onVerified via pendingSave.
  function handleGuestSubmit() {
    if (!formRef.current) return;
    const errors = validateForm(new FormData(formRef.current));
    if (errors) {
      setSubmitErrors(errors);
      scrollToFirstError(formRef.current, errors);
      return;
    }
    setSubmitErrors(null);
    track("wizard_started", {
      source: "transmontana",
      checklist_done: checked.size,
    });
    setConfirmPhase("email");
  }

  // Once the guest sub-phase is running, Enter must not trigger a bare form
  // submit (no session yet) — route it to that phase's own action
  // (send/verify code) instead. Same reasoning as the wizard's
  // handleKeyDown (design D3). For signed-in users Enter falls through to
  // implicit submission → onSubmit → validation; for guests in "review" it
  // routes to the same validation+phase-flip the button runs.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (confirmPhase !== "review") {
      event.preventDefault();
      guestPrimaryActionRef.current?.();
    } else if (needsGuestAuth) {
      // Guests have no submit control (implicit submission is suppressed
      // with two blocking inputs) — Enter would be a dead key without this.
      event.preventDefault();
      handleGuestSubmit();
    }
  }

  function toggle(key: string, next: boolean) {
    const updated = new Set(checked);
    if (next) {
      updated.add(key);
    } else {
      updated.delete(key);
    }
    track("checklist_item_toggled", {
      item: key,
      checked: next,
      source: "transmontana",
    });
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
  const needsGuestAuth = isLoaded && !isSignedIn;
  const inGuestPhase = needsGuestAuth && confirmPhase !== "review";

  return (
    <Card
      as="form"
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      padding="md"
      className="flex flex-col gap-6"
    >
      {/* Fixed identity for this surface: an enduro moto measured in horas.
          `source` feeds the action's analytics, same as the wizard's. */}
      <input type="hidden" name="type" value="moto" />
      <input type="hidden" name="subtype" value="moto_enduro" />
      <input type="hidden" name="metricUnit" value="horas" />
      <input type="hidden" name="source" value="transmontana" />

      {/* The create-moto form leads the card — this checklist IS the
          creation surface now. */}
      <div className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          name="name"
          placeholder="Husqvarna TE 300"
          autoComplete="off"
          error={errorFor("name")}
        />
        <OptionCardGroup
          label="Motor"
          name="engine"
          value={engine}
          onChange={setEngine}
          options={ENGINE_OPTIONS}
          error={errorFor("engine")}
        />
        <TextField
          label="Horas de la moto"
          name="currentValue"
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          placeholder="Ej: 45"
          error={errorFor("currentValue")}
        />
      </div>

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
              the whole row toggles, rows separated by divide-y. The inputs
              carry no `name`, so they never enter the form's FormData. */}
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
        Creá tu cuenta con tu email para guardar tu progreso y tu moto.
      </p>

      <FieldError
        message={state.status === "error" ? state.message : undefined}
      />

      {inGuestPhase ? (
        <GuestAuthStep
          confirmPhase={confirmPhase}
          actionRef={guestPrimaryActionRef}
          onEmailSent={() => setConfirmPhase("code")}
          onVerified={() => {
            track("account_created", { source: "transmontana" });
            setPendingSave(true);
          }}
        />
      ) : needsGuestAuth ? (
        <button
          type="button"
          onClick={handleGuestSubmit}
          className="cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-[var(--duration-quick)] enabled:active:scale-[0.98] hover:bg-primary-hover"
        >
          Crear moto
        </button>
      ) : (
        <SubmitButton
          isPending={isPending || !isLoaded}
          label="Crear moto"
          pendingLabel="Creando..."
        />
      )}
    </Card>
  );
}
