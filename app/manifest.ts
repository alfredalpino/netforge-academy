import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NetForge — Network Engineering Academy",
    short_name: "NetForge",
    description:
      "Elite 28-week networking curriculum for NOC Analyst and Network Engineer roles.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    theme_color: "#070b12",
    background_color: "#070b12",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Today's Plan",
        short_name: "Today",
        url: "/today",
        description: "Open today's study blocks and tasks",
      },
      {
        name: "Drills",
        short_name: "Drills",
        url: "/drills",
        description: "Practice subnetting and recall drills",
      },
      {
        name: "Dashboard",
        short_name: "Home",
        url: "/",
        description: "View progress and journey overview",
      },
    ],
  };
}
