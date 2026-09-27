import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { BRAND_BOX, BRAND_PRIMARY } from "@/lib/brand";
import { RACES, findRace } from "@/lib/landing/races";

export const alt = "Checklist pre-carrera | Mi Vehículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// dynamicParams=false on the sibling page covers this route too — without
// its own param list every og-image URL 404s.
export function generateStaticParams() {
  return RACES.map((race) => ({ slug: race.slug }));
}

// The logo lives only in public/ (not an importable asset). OG routes run on
// the Node runtime here, so fs is fine — but if the read ever fails we ship
// the text-only variant instead of failing image generation.
function loadLogoDataUrl(image: string): string | null {
  try {
    const data = readFileSync(join(process.cwd(), "public", image));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const race = findRace(slug);
  if (!race) notFound();

  const logo = loadLogoDataUrl(race.image);

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
            alt={race.name}
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
            ¿Vas al{" "}
            <span style={{ color: BRAND_PRIMARY, marginLeft: 18 }}>
              {race.name}?
            </span>
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
