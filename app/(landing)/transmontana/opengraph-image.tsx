import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_BOX, BRAND_PRIMARY } from "@/lib/brand";

export const alt = "Dejá tu moto lista para el Transmontaña | Mi Vehículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The logo lives only in public/ (not an importable asset). OG routes run on
// the Node runtime here, so fs is fine — but if the read ever fails we ship
// the text-only variant instead of failing image generation.
function loadLogoDataUrl(): string | null {
  try {
    const data = readFileSync(join(process.cwd(), "public/transmontana.png"));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

export default function Image() {
  const logo = loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          padding: 80,
          background: BRAND_BOX,
          color: "#f1eefb",
          fontFamily: "sans-serif",
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt="Transmontaña"
            width={320}
            height={320}
            style={{ borderRadius: 40 }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 720,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            ¿Vas al <span style={{ color: BRAND_PRIMARY, marginLeft: 18 }}>Transmontaña?</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#a49dc4",
              lineHeight: 1.3,
            }}
          >
            Dejá tu moto lista para la carrera — checklist pre-carrera
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
