import { type ComponentProps } from "react";
import { FieldError } from "@/components/ui/field-error";

type CheckboxFieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  error?: string;
};

export function CheckboxField({
  label,
  name,
  error,
  className,
  ...props
}: CheckboxFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className={`flex items-center gap-2 text-sm text-foreground ${
          error ? "text-danger" : ""
        }`}
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          className={`h-4 w-4 rounded border bg-surface-2 outline-none transition-colors focus:border-primary ${
            error ? "border-danger" : "border-surface-border"
          } ${className ?? ""}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {label}
      </label>
      <FieldError message={error} />
    </div>
  );
}
