import type { ZodError } from "zod";

export interface ActionState<T = unknown> {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof T & string, string>>;
}

export function fieldErrorsFromZodError<T>(
  error: ZodError,
): Partial<Record<keyof T & string, string>> {
  const fieldErrors: Partial<Record<keyof T & string, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    const field = key as keyof T & string;
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export function emptyToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}
