"use client";

import { useRef } from "react";
import { FieldError } from "@/components/ui/field-error";
import { toDateInputValue } from "@/lib/format";

export function DateField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="text-xs font-bold tracking-widest text-muted uppercase"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = toDateInputValue(new Date());
            }
          }}
          className="cursor-pointer text-xs font-bold tracking-widest text-primary uppercase transition-colors hover:text-foreground"
        >
          Hoy
        </button>
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="date"
        defaultValue={defaultValue}
        className={`rounded-xl border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-surface ${
          error ? "border-danger" : "border-surface-border"
        }`}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </div>
  );
}
