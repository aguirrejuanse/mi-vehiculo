import { ImageResponse } from "next/og";
import { BRAND_BOX, BRAND_PRIMARY } from "@/lib/brand";

export const alt = "Mi Vehículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No branded image asset exists yet, so we generate the OG image at
// request/build time instead of shipping a static file. The tile reuses
// the app/icon.tsx vehicle mark.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 64,
          width: "100%",
          height: "100%",
          background: BRAND_BOX,
          padding: "0 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 340,
            height: 340,
            borderRadius: 40,
            background: "#171232",
          }}
        >
          <svg
            width="220"
            height="220"
            viewBox="0 0 24 24"
            fill="none"
            stroke={BRAND_PRIMARY}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12l1.5-4.5A2 2 0 0 1 6.4 6h11.2a2 2 0 0 1 1.9 1.5L21 12" />
            <path d="M3 12h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
            <circle cx="7.5" cy="17" r="1.5" fill={BRAND_PRIMARY} />
            <circle cx="16.5" cy="17" r="1.5" fill={BRAND_PRIMARY} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
          <p
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: BRAND_PRIMARY,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Mi Vehículo
          </p>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.95,
              color: "#f1eefb",
              textTransform: "uppercase",
              margin: "24px 0 0",
            }}
          >
            Todo lo que tu
          </h1>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.95,
              color: "#f1eefb",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            vehículo necesita
          </h1>
          <p
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: BRAND_PRIMARY,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "24px 0 0",
            }}
          >
            Motos · Bicis · Autos · Monopatines
          </p>
          <p
            style={{
              fontSize: 24,
              color: "#a49dc4",
              margin: "20px 0 0",
            }}
          >
            Creá tu vehículo y el plan te dice qué hacerle y cuándo.
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 14,
            background: BRAND_PRIMARY,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
