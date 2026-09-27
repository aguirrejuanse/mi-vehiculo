import {
  SUBTYPES_BY_TYPE,
  SUBTYPE_LABELS,
  ENGINE_OPTIONS_BY_TYPE,
  ENGINE_LABELS,
  type VehicleEngine,
  type VehicleInput,
  type VehicleSubtype,
  type VehicleType,
} from "@/lib/validation/vehicle";
import { OptionCardGroup } from "@/components/ui/option-card-group";
import { TextField } from "@/components/ui/text-field";

export type StepId =
  | "tipo"
  | "subtipo"
  | "motor"
  | "apodo"
  | "estado"
  | "uso"
  | "confirmar";

// One question per screen; each id filters `validateVehicleFields()` so
// "Continuar" only gates on the fields that step actually collects. See
// design ADR #8.
export const STEP_FIELDS: Record<StepId, readonly (keyof VehicleInput)[]> = {
  tipo: ["type"],
  subtipo: ["subtype"],
  motor: ["engine", "displacementCc"],
  apodo: ["name"],
  estado: ["currentValue", "metricUnit"],
  uso: ["usageRatePerWeek"],
  confirmar: [],
};

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "moto", label: "Moto" },
  { value: "auto", label: "Auto/Camioneta" },
  { value: "bicicleta", label: "Bicicleta" },
  { value: "monopatin", label: "Monopatín" },
];

const NAME_PLACEHOLDER_BY_TYPE: Record<VehicleType, string> = {
  moto: "Kawasaki Ninja",
  auto: "Nissan Skyline",
  bicicleta: "Trek Marlin",
  monopatin: "Xiaomi Pro 2",
};

const NAME_PLACEHOLDER_BY_SUBTYPE: Partial<Record<VehicleSubtype, string>> = {
  moto_enduro: "KTM 350 EXC",
  bici_enduro: "Specialized Stumpjumper",
  bici_downhill: "Commencal Supreme",
  bici_electrica: "Specialized Turbo Vado",
};

function namePlaceholder(
  type: VehicleType | "",
  subtype: VehicleSubtype | "",
): string {
  if (subtype && NAME_PLACEHOLDER_BY_SUBTYPE[subtype]) {
    return NAME_PLACEHOLDER_BY_SUBTYPE[subtype];
  }
  return type ? NAME_PLACEHOLDER_BY_TYPE[type] : "Mi vehículo";
}

const METRIC_UNITS: { value: "horas" | "km"; label: string }[] = [
  { value: "horas", label: "Horas" },
  { value: "km", label: "Kilómetros" },
];

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  moto: "Moto",
  auto: "Auto/Camioneta",
  bicicleta: "Bicicleta",
  monopatin: "Monopatín",
};

const METRIC_UNIT_LABELS: Record<"horas" | "km", string> = {
  horas: "Horas",
  km: "Kilómetros",
};

type StepErrors = Partial<Record<keyof VehicleInput, string>> | null;

type ConfirmSummary = {
  name: string;
  currentValue: string;
  usageRatePerWeek: string;
  engine: string;
  displacementCc: string;
};

type WizardStepsProps = {
  stepId: StepId;
  hasSubtypes: boolean;
  hasEngine: boolean;
  type: VehicleType | "";
  subtype: VehicleSubtype | "";
  engine: VehicleEngine | "unknown" | "";
  metricUnit: "horas" | "km" | "";
  onTypeChange: (type: VehicleType) => void;
  onSubtypeChange: (subtype: VehicleSubtype) => void;
  onEngineChange: (engine: VehicleEngine | "unknown") => void;
  onMetricUnitChange: (metricUnit: "horas" | "km") => void;
  stepErrors: StepErrors;
  fieldErrors: StepErrors;
  summary: ConfirmSummary;
};

function errorFor(
  field: keyof VehicleInput,
  stepErrors: StepErrors,
  fieldErrors: StepErrors,
) {
  return stepErrors?.[field] ?? fieldErrors?.[field];
}

// All step fieldsets stay mounted at all times — `hidden` toggles
// visibility. Steps that don't apply to the selected type (subtipo for
// auto/monopatin, motor for bici/monopatin) additionally DISABLE their
// controls: a disabled input never reaches FormData, so a stale choice from
// a previous type can't sneak into the payload. The single final submit on
// "confirmar" posts a complete payload from every still-enabled input.
// See design ADR #7 / ADR #10.
export function WizardSteps({
  stepId,
  hasSubtypes,
  hasEngine,
  type,
  subtype,
  engine,
  metricUnit,
  onTypeChange,
  onSubtypeChange,
  onEngineChange,
  onMetricUnitChange,
  stepErrors,
  fieldErrors,
  summary,
}: WizardStepsProps) {
  const subtypeOptions = type ? SUBTYPES_BY_TYPE[type] : [];
  // "No sé" submits "unknown" (→ engine null): the catalog drops
  // engine-tagged rows rather than guess — see getSuggestedMaintenances.
  // It's a real value, not the "" default, so the step can distinguish
  // "chose No sé" from "nothing picked" and gate on the latter.
  const engineOptions: { value: VehicleEngine | "unknown"; label: string }[] =
    type
      ? [
          ...ENGINE_OPTIONS_BY_TYPE[type].map((option) => ({
            value: option as VehicleEngine,
            label: ENGINE_LABELS[option],
          })),
          { value: "unknown" as const, label: "No sé" },
        ]
      : [];

  return (
    <>
      <fieldset hidden={stepId !== "tipo"} className="wizard-step flex flex-col gap-5">
        <OptionCardGroup
          label="Tipo de vehículo"
          name="type"
          value={type}
          onChange={onTypeChange}
          options={VEHICLE_TYPES}
          error={errorFor("type", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset
        hidden={stepId !== "subtipo"}
        disabled={!hasSubtypes}
        className="wizard-step flex flex-col gap-5"
      >
        <OptionCardGroup
          label="Subtipo"
          name="subtype"
          value={subtype}
          onChange={onSubtypeChange}
          options={subtypeOptions.map((option) => ({
            value: option,
            label: SUBTYPE_LABELS[option],
          }))}
          disabled={!hasSubtypes}
          error={errorFor("subtype", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset
        hidden={stepId !== "motor"}
        disabled={!hasEngine}
        className="wizard-step flex flex-col gap-5"
      >
        <OptionCardGroup
          label="Motor"
          name="engine"
          value={engine}
          onChange={onEngineChange}
          options={engineOptions}
          disabled={!hasEngine}
          error={errorFor("engine", stepErrors, fieldErrors)}
        />
        <TextField
          label="Cilindrada en cc (opcional)"
          name="displacementCc"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="Ej: 300"
          defaultValue=""
          error={errorFor("displacementCc", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset hidden={stepId !== "apodo"} className="wizard-step flex flex-col gap-5">
        <TextField
          label="Nombre"
          name="name"
          placeholder={namePlaceholder(type, subtype)}
          defaultValue=""
          error={errorFor("name", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset hidden={stepId !== "estado"} className="wizard-step flex flex-col gap-5">
        <OptionCardGroup
          label="Unidad de medida"
          name="metricUnit"
          value={metricUnit}
          onChange={onMetricUnitChange}
          options={METRIC_UNITS}
          error={errorFor("metricUnit", stepErrors, fieldErrors)}
        />
        <TextField
          label="Valor actual"
          name="currentValue"
          type="number"
          step="any"
          min={0}
          placeholder="Ej: 100"
          defaultValue=""
          error={errorFor("currentValue", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset hidden={stepId !== "uso"} className="wizard-step flex flex-col gap-5">
        <TextField
          label="Uso semanal estimado (opcional)"
          name="usageRatePerWeek"
          type="number"
          step="any"
          min={0}
          placeholder="Ej: 5"
          defaultValue=""
          error={errorFor("usageRatePerWeek", stepErrors, fieldErrors)}
        />
      </fieldset>

      <fieldset
        hidden={stepId !== "confirmar"}
        className="wizard-step flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-2 p-4 text-sm">
          <SummaryRow
            label="Tipo"
            value={type ? VEHICLE_TYPE_LABELS[type] : "—"}
          />
          {hasSubtypes ? (
            <SummaryRow
              label="Subtipo"
              value={subtype ? SUBTYPE_LABELS[subtype] : "—"}
            />
          ) : null}
          {hasEngine ? (
            <SummaryRow
              label="Motor"
              value={
                summary.engine === "unknown"
                  ? "No sé"
                  : summary.engine
                    ? (ENGINE_LABELS[summary.engine as VehicleEngine] ??
                      summary.engine)
                    : "No especificado"
              }
            />
          ) : null}
          {hasEngine && summary.displacementCc ? (
            <SummaryRow
              label="Cilindrada"
              value={`${summary.displacementCc} cc`}
            />
          ) : null}
          <SummaryRow label="Nombre" value={summary.name || "—"} />
          <SummaryRow
            label="Unidad de medida"
            value={metricUnit ? METRIC_UNIT_LABELS[metricUnit] : "—"}
          />
          <SummaryRow
            label="Valor actual"
            value={summary.currentValue || "—"}
          />
          <SummaryRow
            label="Uso semanal estimado"
            value={summary.usageRatePerWeek || "Sin especificar"}
          />
        </div>
        <p className="text-xs font-semibold text-danger">
          El tipo, el subtipo, el motor y la cilindrada no se pueden cambiar
          después de crear el vehículo. Revisá que estén bien antes de
          confirmar.
        </p>
      </fieldset>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-bold tracking-widest text-muted uppercase">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
