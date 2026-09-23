import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Vehículo",
    short_name: "Mi Vehículo",
    description: "Llevá el control del mantenimiento de tus vehículos",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f1fb",
    theme_color: "#6c5ce7",
    icons: [
      {
        // Served by app/icon.tsx (Next's file-based icon convention).
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        // Served by app/apple-icon.tsx.
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
