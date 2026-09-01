import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clario",
    short_name: "Clario",
    description: "Modern team communication and collaboration platform",
    start_url: "/",
    scope: "/",
    id: "/?source=pwa",
    display: "standalone",
    display_override: ["standalone", "window-controls-overlay", "minimal-ui"],
    background_color: "#FEFEFF",
    theme_color: "#2511BF",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "social"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/Clario_logomark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "Open Clario Dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Teams",
        url: "/teams",
        description: "Open Clario Teams",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}

