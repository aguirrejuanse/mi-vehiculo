export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-AR");
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Formats a fresh Date (e.g. `new Date()`, never a value round-tripped through the
// DB) as the local "YYYY-MM-DD" value a <input type="date"> expects. Only safe for
// values that were never parsed from a date-only string, since those are stored as
// UTC midnight — reading them back with local getters can shift the day in
// negative-UTC-offset timezones like Argentina's.
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
