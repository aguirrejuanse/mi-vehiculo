import { FieldError } from "@/components/ui/field-error";

type OptionCardGroupOption<V extends string> = {
  value: V;
  label: string;
  description?: string;
};

type OptionCardGroupProps<V extends string> = {
  label: string;
  name: string;
  options: readonly OptionCardGroupOption<V>[];
  value: V | "";
  onChange: (value: V) => void;
  error?: string;
  disabled?: boolean;
  columns?: 1 | 2;
};

// Native `<input type="radio">` group styled as cards. Native radios land in
// FormData "for free" on submit (no manual JS state wiring needed) while
// still reading correctly as one question per screen. Kept controlled so the
// wizard can react to changes (e.g. resetting subtype when type changes).
// See design ADR #9.
export function OptionCardGroup<V extends string>({
  label,
  name,
  options,
  value,
  onChange,
  error,
  disabled,
  columns = 2,
}: OptionCardGroupProps<V>) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-xs font-bold tracking-widest text-muted uppercase">
        {label}
      </legend>
      <div
        className={`grid gap-3 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-w-0 flex-col gap-0.5 rounded-xl border px-4 py-3 text-sm break-words transition duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                checked
                  ? "border-primary bg-primary-soft ring-1 ring-primary"
                  : "border-surface-border bg-surface-2"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft hover:shadow-sm active:translate-y-0 active:scale-[0.98]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <span className="font-semibold text-foreground">
                {option.label}
              </span>
              {option.description ? (
                <span className="text-xs text-muted">
                  {option.description}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
