"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { trackError } from "@/lib/analytics/client";

// Root-level boundary: replaces the root layout on a crash there (e.g.
// Clerk/PostHog provider), so it must render its own <html>/<body>. Global
// CSS may not be loaded — keep everything inline.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  // The root layout (and PostHogProvider inside it) may be what crashed —
  // trackError no-ops when posthog.init never ran.
  trackError(error, { digest: error.digest });

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#fdfcff",
          color: "#201b3d",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            lineHeight: 1,
            color: "#6c5ce7",
            margin: 0,
          }}
        >
          Error
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Algo salió mal.
        </p>
        <p style={{ maxWidth: "28rem", color: "#837c9e", margin: 0 }}>
          Tuvimos un problema inesperado. Podés intentar de nuevo o volver al
          inicio.
        </p>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              cursor: "pointer",
              borderRadius: "1rem",
              border: 0,
              backgroundColor: "#6c5ce7",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Reintentar
          </button>
          <Link
            href="/"
            style={{
              color: "#837c9e",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </body>
    </html>
  );
}
