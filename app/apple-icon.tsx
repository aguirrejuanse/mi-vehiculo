import { ImageResponse } from "next/og";
import { BRAND_BOX, BRAND_PRIMARY } from "@/lib/brand";

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
          background: BRAND_BOX,
        }}
      >
        <svg
          width="110"
          height="110"
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
    ),
    { ...size },
  );
}
