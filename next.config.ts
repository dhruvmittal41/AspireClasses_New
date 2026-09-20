import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async redirects() {
    return [
      { source: "/home", destination: "/dashboard", permanent: true },
      {
        source: "/admin/login",
        destination: "/admin-login",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
