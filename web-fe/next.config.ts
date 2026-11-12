import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
      {
        source: "/gaji",
        destination: "/tenaga-medis/gaji",
        permanent: false,
      },
      {
        source: "/absensi",
        destination: "/tenaga-medis/absensi",
        permanent: false,
      },
      {
        source: "/jadwal",
        destination: "/tenaga-medis/jadwal",
        permanent: false,
      },
      {
        source: "/profil",
        destination: "/tenaga-medis/profil",
        permanent: false,
      },
      {
        source: "/kepegawaian",
        destination: "/hrd/kepegawaian",
        permanent: false,
      },
      {
        source: "/rekap-absensi",
        destination: "/hrd/absensi",
        permanent: false,
      },
      {
        source: "/kelola-jadwal",
        destination: "/sekretaris/jadwal",
        permanent: false,
      },
      {
        source: "/pedoman-gaji",
        destination: "/keuangan/pedoman-gaji",
        permanent: false,
      },
      {
        source: "/aju-banding",
        destination: "/keuangan/aju-banding",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
