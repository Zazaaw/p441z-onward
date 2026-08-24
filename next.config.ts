import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Foto profil pegawai dari storage ESS-DEV.
        protocol: "https",
        hostname: "qlhucbjdeyvzqdhqwdjz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Sampul album dari Last.fm (dua subdomain yang dipakai bergantian).
      { protocol: "https", hostname: "lastfm.freetls.fastly.net" },
      { protocol: "https", hostname: "lastfm-img2.akamaized.net" },
    ],
  },
};

export default nextConfig;
