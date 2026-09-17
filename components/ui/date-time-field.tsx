"use client";

import { useRef } from "react";
import { FieldError } from "@/components/ui/field-error";
import { toDateTimeLocalValue } from "@/lib/format";

export function DateTimeField({
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
          className="text-xs font-bold tracking-widest text-rb-muted uppercase"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = toDateTimeLocalValue(new Date());
            }
          }}
          className="cursor-pointer text-xs font-bold tracking-widest text-rb-red uppercase transition-colors hover:text-foreground"
        >
          Hoy
        </button>
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="datetime-local"
        defaultValue={defaultValue}
        className={`rounded-sm border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-rb-red ${
          error ? "border-rb-red" : "border-surface-border"
        }`}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </div>
  );
}
