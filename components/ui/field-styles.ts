// Shared border/focus/error styling for text/select/date inputs. Not used by
// CheckboxField — its input is a differently-shaped control (h-4 w-4 rounded,
// no py/text sizing), not just an error-state variant of this class string.
export function inputClassName(hasError?: boolean): string {
  return `rounded-xl border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-surface ${
    hasError ? "border-danger" : "border-surface-border"
  }`;
}
