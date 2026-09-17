export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-AR");
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Formats a Date as the local "YYYY-MM-DDTHH:mm" value a <input type="datetime-local">
// expects. Deliberately uses local getters (not toISOString, which is UTC) so the
// displayed value matches the wall-clock time the maintenance was performed at.
export function toDateTimeLocalValue(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
