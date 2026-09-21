import {
  SUBTYPES_BY_TYPE,
  SUBTYPE_LABELS,
  type VehicleInput,
  type VehicleSubtype,
  type VehicleType,
} from "@/lib/validation/vehicle";
import { OptionCardGroup } from "@/components/ui/option-card-group";
import { TextField } from "@/components/ui/text-field";

export type StepId =
  | "tipo"
  | "subtipo"
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
  apodo: ["name"],
  estado: ["currentValue", "metricUnit"],
  uso: ["usageRatePerWeek"],
  confirmar: [],
};

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "moto", label: "Moto" },
  { value: "auto", label: "Auto" },
  { value: "bicicleta", label: "Bicicleta" },
  { value: "monopatin", label: "Monopatín" },
];

const METRIC_UNITS: { value: "horas" | "km"; label: string }[] = [
  { value: "horas", label: "Horas" },
  { value: "km", label: "Kilómetros" },
];

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  moto: "Moto",
  auto: "Auto",
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
};

type WizardStepsProps = {
  stepId: StepId;
  hasSubtypes: boolean;
  type: VehicleType | "";
  subtype: VehicleSubtype | "";
  metricUnit: "horas" | "km" | "";
  onTypeChange: (type: VehicleType) => void;
  onSubtypeChange: (subtype: VehicleSubtype) => void;
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

// All six step fieldsets stay mounted at all times — only `hidden` toggles
// visibility (never `disabled`, which would strip values from FormData).
// The single final submit on "confirmar" posts a complete payload built from
// every step's still-mounted inputs. See design ADR #7.
export function WizardSteps({
  stepId,
  hasSubtypes,
  type,
  subtype,
  metricUnit,
  onTypeChange,
  onSubtypeChange,
  onMetricUnitChange,
  stepErrors,
  fieldErrors,
  summary,
}: WizardStepsProps) {
  const subtypeOptions = type ? SUBTYPES_BY_TYPE[type] : [];

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

      <fieldset hidden={stepId !== "apodo"} className="wizard-step flex flex-col gap-5">
        <TextField
          label="Nombre"
          name="name"
          placeholder="Enduro 350"
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
          El tipo y el subtipo no se pueden cambiar después de crear el
          vehículo. Revisá que estén bien antes de confirmar.
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
