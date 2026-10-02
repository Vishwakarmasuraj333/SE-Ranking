import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin.reports.list.html',
        destination: '/reports',
      },
      {
        source: '/admin.user.whitelabel.html',
        destination: '/agency-pack',
      },
      {
        source: '/admin.lead_generator.html',
        destination: '/agency-pack',
      },
    ];
  },
};

export default nextConfig;
