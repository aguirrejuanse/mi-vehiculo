// Strict decimal check for FormData numeric strings. `Number()` alone also
// accepts "0x10", "Infinity" and "1e999" — Postgres numeric rejects or
// mis-stores those. The optional leading `-` stays so the >= 0 / > 0 refine
// in each schema can report "no puede ser negativo" instead of a generic
// "not a number" for negative input.
export function isDecimalString(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}
