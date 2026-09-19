"use client";

// Renders a real timestamp (never a date-only value) in the viewer's own
// browser timezone, not the server's. Server Components run on Vercel's
// runtime (UTC), so formatting there would show every viewer the same UTC
// clock time regardless of where they actually are. `suppressHydrationWarning`
// is required here: the server-rendered text (server TZ) and the
// client-rendered text (browser TZ) legitimately differ, and this is React's
// sanctioned way to let the client value win without a hydration error.
export function LocalTime({
  value,
  mode = "time",
}: {
  value: Date | string;
  mode?: "time" | "datetime";
}) {
  const date = new Date(value);
  const formatted =
    mode === "time"
      ? date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

  return <span suppressHydrationWarning>{formatted}</span>;
}
