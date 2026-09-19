// Formats a fresh Date (e.g. `new Date()`, never a value round-tripped through the
// DB) as the local "YYYY-MM-DD" value a <input type="date"> expects. Only safe for
// values that were never parsed from a date-only string, since those are stored as
// UTC midnight — reading them back with local getters can shift the day in
// negative-UTC-offset timezones like Argentina's.
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Formats a Date using UTC getters, not local ones. Use this for any date
// that was computed in UTC (e.g. lib/maintenance/next-due.ts) or that was
// parsed from a date-only string stored as UTC midnight. Local getters would
// shift the day back by one in negative-UTC-offset timezones like Argentina's.
export function formatDateUTC(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}
