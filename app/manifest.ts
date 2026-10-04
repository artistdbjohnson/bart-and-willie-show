import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Bart & Willie Show",
    short_name: "The Bart & Willie Show",
    description:
      "Bart Scott and Willie Colon, former New York Jets, with new episodes Mondays and Fridays.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#145c32",
    theme_color: "#145c32",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
