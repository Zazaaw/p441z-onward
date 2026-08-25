import type { MetadataRoute } from "next";

/**
 * Manifest PWA — supaya saat dipasang ke layar utama ponsel, aplikasi ini
 * muncul sebagai "Onward" dengan warna dan ikonnya sendiri, bukan sebagai
 * tab browser bernama URL.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Onward",
    short_name: "Onward",
    description: "Maju sedikit setiap hari. Satu hari lebih baik dari kemarin.",
    start_url: "/",
    display: "standalone",
    // Hitam, senada dengan tema gelap yang jadi tampilan utamanya.
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
