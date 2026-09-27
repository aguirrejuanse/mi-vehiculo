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
        {logo ? (
          <img
            src={logo}
            alt={race.name}
            width={340}
            height={340}
            style={{ borderRadius: 40 }}
          />
        ) : null}
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
            Checklist pre-carrera
          </p>
          <h1
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 0.95,
              color: "#f1eefb",
              textTransform: "uppercase",
              margin: "24px 0 0",
            }}
          >
            ¿Vas al
          </h1>
          <h1
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 0.95,
              color: "#f1eefb",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {race.name}?
          </h1>
          <p
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: BRAND_PRIMARY,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "24px 0 0",
            }}
          >
            {race.dateLine}
          </p>
          <p
            style={{
              fontSize: 22,
              color: "#a49dc4",
              margin: "20px 0 0",
            }}
          >
            {race.detailLine}
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
