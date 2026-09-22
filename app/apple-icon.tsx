import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 88,
          fontWeight: 800,
        }}
      >
        MV
      </div>
    ),
    { ...size },
  );
}
