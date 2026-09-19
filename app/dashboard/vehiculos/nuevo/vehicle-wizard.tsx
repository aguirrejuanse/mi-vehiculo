"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { createVehicleAction } from "@/app/dashboard/vehiculos/nuevo/actions";
import {
  STEP_FIELDS,
  WizardSteps,
  type StepId,
} from "@/app/dashboard/vehiculos/nuevo/wizard-steps";
import {
  SUBTYPES_BY_TYPE,
  METRIC_UNIT_BY_SUBTYPE,
  validateVehicleFields,
  type VehicleInput,
  type VehicleSubtype,
  type VehicleType,
} from "@/lib/validation/vehicle";
import { useActionFormState } from "@/lib/hooks/use-action-form-state";
import { WizardProgress } from "@/components/ui/wizard-progress";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

type StepErrors = Partial<Record<keyof VehicleInput, string>> | null;

function pickFields(
  errors: Partial<Record<keyof VehicleInput, string>>,
  fields: readonly (keyof VehicleInput)[],
): StepErrors {
  const picked: Partial<Record<keyof VehicleInput, string>> = {};
  for (const field of fields) {
    if (errors[field]) picked[field] = errors[field];
  }
  return Object.keys(picked).length > 0 ? picked : null;
}

export function VehicleWizard() {
  const { state, formAction, isPending, handleSubmit, fieldErrors } =
    useActionFormState(createVehicleAction, validateVehicleFields);

  const formRef = useRef<HTMLFormElement>(null);

  const [stepId, setStepId] = useState<StepId>("tipo");
  const [stepErrors, setStepErrors] = useState<StepErrors>(null);

  const [type, setType] = useState<VehicleType | "">("");
  const [subtype, setSubtype] = useState<VehicleSubtype | "">("");
  const [metricUnit, setMetricUnit] = useState<"horas" | "km" | "">("");
  const [summary, setSummary] = useState({
    name: "",
    currentValue: "",
    usageRatePerWeek: "",
  });

  const hasSubtypes = type ? SUBTYPES_BY_TYPE[type].length > 0 : false;

  // Steps are DERIVED, never stored as an index — the array length changes
  // depending on whether the chosen type has a subtype taxonomy. See design
  // "Wizard State Machine".
  const steps: StepId[] = [
    "tipo",
    ...(hasSubtypes ? (["subtipo"] as const) : []),
    "apodo",
    "estado",
    "uso",
    "confirmar",
  ];

  function handleTypeChange(nextType: VehicleType) {
    setType(nextType);
    // Fixes the stale-subtype bug from the slice-1 interim form: switching
    // type must never leave a subtype from the previous type in FormData.
    // See design ADR #10.
    setSubtype("");
  }

  function handleSubtypeChange(nextSubtype: VehicleSubtype) {
    setSubtype(nextSubtype);
    setMetricUnit(METRIC_UNIT_BY_SUBTYPE[nextSubtype]);
  }

  function goNext() {
    const fd = new FormData(formRef.current!);
    const errors = validateVehicleFields(fd);
    const nextStepErrors = errors ? pickFields(errors, STEP_FIELDS[stepId]) : null;

    if (nextStepErrors) {
      setStepErrors(nextStepErrors);
      return;
    }
    setStepErrors(null);

    const currentIndex = steps.indexOf(stepId);
    const nextStep = steps[currentIndex + 1];
    if (!nextStep) return;

    if (nextStep === "confirmar") {
      setSummary({
        name: String(fd.get("name") ?? ""),
        currentValue: String(fd.get("currentValue") ?? ""),
        usageRatePerWeek: String(fd.get("usageRatePerWeek") ?? ""),
      });
    }

    setStepId(nextStep);
  }

  function goBack() {
    const currentIndex = steps.indexOf(stepId);
    if (currentIndex <= 0) return;
    setStepErrors(null);
    setStepId(steps[currentIndex - 1]);
  }

  // A form with a single visible text input performs implicit submission on
  // Enter even with no submit button in the accessibility tree — real
  // browser gotcha. Guard it everywhere except the final "confirmar" step.
  // See design ADR #11.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (stepId === "confirmar") return;
    event.preventDefault();
    goNext();
  }

  const currentIndex = steps.indexOf(stepId);
  const isFirstStep = currentIndex === 0;
  const isConfirmStep = stepId === "confirmar";

  return (
    <Card
      as="form"
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      padding="md"
      className="flex flex-col gap-6"
    >
      <WizardProgress current={currentIndex + 1} total={steps.length} />

      <WizardSteps
        stepId={stepId}
        hasSubtypes={hasSubtypes}
        type={type}
        subtype={subtype}
        metricUnit={metricUnit}
        onTypeChange={handleTypeChange}
        onSubtypeChange={handleSubtypeChange}
        onMetricUnitChange={setMetricUnit}
        stepErrors={stepErrors}
        fieldErrors={fieldErrors ?? null}
        summary={summary}
      />

      <FieldError
        message={state.status === "error" ? state.message : undefined}
      />

      <div className="flex items-center gap-3">
        {!isFirstStep ? (
          <button
            type="button"
            onClick={goBack}
            className="cursor-pointer rounded-xl border border-surface-border px-5 py-3 text-sm font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
          >
            Volver
          </button>
        ) : null}

        {isConfirmStep ? (
          <SubmitButton
            isPending={isPending}
            label="Confirmar y guardar"
            pendingLabel="Guardando..."
          />
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="ml-auto cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
          >
            Continuar
          </button>
        )}
      </div>
    </Card>
  );
}
