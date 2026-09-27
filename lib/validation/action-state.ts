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

// Disabled inputs are absent from FormData entirely, so `formData.get`
// returns null for them — not "". Map both to undefined so an `.optional()`
// field treats "control not submitted" the same as "left blank".
export function emptyToUndefined(value: unknown): unknown {
  if (value == null) return undefined;
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}
