import { type ComponentProps } from "react";
import { FieldError } from "@/components/ui/field-error";
import { inputClassName } from "@/components/ui/field-styles";

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
        className={`${inputClassName(Boolean(error))} ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}
