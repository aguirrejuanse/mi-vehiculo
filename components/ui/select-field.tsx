import { type ComponentProps } from "react";
import { FieldError } from "@/components/ui/field-error";

type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
  name: string;
  error?: string;
};

export function SelectField({
  label,
  name,
  error,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs font-bold tracking-widest text-rb-muted uppercase"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`rounded-sm border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-rb-red ${
          error ? "border-rb-red" : "border-surface-border"
        } ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      <FieldError message={error} />
    </div>
  );
}
