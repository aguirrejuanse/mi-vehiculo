"use client";

import { Combobox } from "@base-ui/react/combobox";
import { FieldError } from "@/components/ui/field-error";
import { ChevronDownIcon } from "@/components/ui/icons";
import { inputClassName } from "@/components/ui/field-styles";
import { cn } from "@/lib/cn";

export type ComboboxFieldOption = {
  value: string;
  label: string;
};

type ComboboxFieldProps = {
  label: string;
  // Submitted through a hidden input — the FormData sees the option's
  // `value`, never the typed query, so free text can't leak into the action.
  name: string;
  options: readonly ComboboxFieldOption[];
  defaultValue?: string;
  placeholder?: string;
  error?: string;
};

// Accent-insensitive matching: on mobile people type "liquido" and expect
// "Líquido refrigerante" — the default filter is a case-sensitive includes
// on the raw label.
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Searchable alternative to SelectField for long option lists (user-defined
// maintenance types grow past what a native <select> handles well). Same
// field-shell contract: uppercase label, shared input styling, FieldError.
export function ComboboxField({
  label,
  name,
  options,
  defaultValue,
  placeholder,
  error,
}: ComboboxFieldProps) {
  // Item values are the {value, label} objects themselves: Base UI then
  // derives the input display from `label` and the hidden input's submitted
  // string from `value` automatically.
  const defaultOption = options.find((option) => option.value === defaultValue);

  return (
    <div className="flex flex-col gap-1.5">
      <Combobox.Root
        items={options}
        name={name}
        defaultValue={defaultOption}
        filter={(option, query) =>
          normalize(option.label).includes(normalize(query))
        }
      >
        {/* Native label, not Combobox.Label — Base UI wires that one to the
            Trigger, leaving the actual Input without an accessible name. */}
        <label
          htmlFor={name}
          className="text-xs font-bold tracking-widest text-muted uppercase"
        >
          {label}
        </label>
        <div className="relative">
          <Combobox.Input
            id={name}
            placeholder={placeholder}
            autoComplete="off"
            className={cn(inputClassName(Boolean(error)), "w-full pr-9")}
            aria-invalid={Boolean(error)}
          />
          <Combobox.Trigger
            aria-label="Abrir opciones"
            className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center text-muted"
          >
            <ChevronDownIcon className="size-4" />
          </Combobox.Trigger>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} className="z-50">
            {/* --anchor-width is set by the positioner so the popup tracks
                the input's width. */}
            <Combobox.Popup className="w-[var(--anchor-width)] overflow-hidden rounded-xl border border-surface-border bg-surface shadow-lg">
              <div className="max-h-60 overflow-y-auto p-1">
                <Combobox.Empty className="px-3 py-2.5 text-sm text-muted">
                  Sin resultados
                </Combobox.Empty>
                <Combobox.List className="flex flex-col">
                  {(option: ComboboxFieldOption) => (
                    <Combobox.Item
                      key={option.value}
                      value={option}
                      className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-foreground outline-none select-none data-[highlighted]:bg-surface-2"
                    >
                      {option.label}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </div>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      <FieldError message={error} />
    </div>
  );
}
