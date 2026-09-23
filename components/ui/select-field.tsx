import { type ComponentProps } from "react";
import { FieldError } from "@/components/ui/field-error";
import { ChevronDownIcon } from "@/components/ui/icons";
import { inputClassName } from "@/components/ui/field-styles";

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
        className="text-xs font-bold tracking-widest text-muted uppercase"
      >
        {label}
      </label>
      {/* appearance-none replaces the OS arrow with our own chevron so the
          gap between text and arrow is controllable (pr-9), and lets the
          truncate classes apply ellipsis to long option labels. */}
      <div className="relative">
        <select
          id={name}
          name={name}
          className={`${inputClassName(Boolean(error))} w-full appearance-none truncate pr-9 ${className ?? ""}`}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </div>
      <FieldError message={error} />
    </div>
  );
}
