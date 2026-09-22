import { ImageResponse } from "next/og";

export const alt = "Mi Vehículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No branded image asset exists yet, so we generate the OG image at
// request/build time instead of shipping a static file.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#201b3d",
          color: "#f1eefb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          Mi <span style={{ color: "#8b7ff2", marginLeft: 20 }}>Vehículo</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a49dc4",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          Llevá el control del mantenimiento de tus vehículos
        </div>
      </div>
    ),
    { ...size },
  );
}
