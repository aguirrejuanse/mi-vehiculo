import { type ComponentProps } from "react";
import { FieldError } from "@/components/ui/field-error";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  error?: string;
};

export function TextField({
  label,
  name,
  error,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs font-bold tracking-widest text-muted uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`rounded-xl border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-surface ${
          error ? "border-danger" : "border-surface-border"
        } ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}
