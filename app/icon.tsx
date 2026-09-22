import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Complements the existing static app/favicon.ico with the modern
// file-based icon convention (Next auto-serves this as an extra <link>).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#201b3d",
          color: "#8b7ff2",
          fontFamily: "sans-serif",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        MV
      </div>
    ),
    { ...size },
  );
}
