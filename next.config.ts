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
    ],
  },
};

export default nextConfig;
