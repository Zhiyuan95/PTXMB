import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Force enable for testing
});

const nextConfig: NextConfig = {
  turbopack: {}, // Required for Next.js 16 + Webpack plugins
  async rewrites() {
    return [
      {
        source: '/api/proxy/quote',
        destination: 'https://tibetan-quotes.vercel.app/api/v1/sentence',
      },
    ];
  },
};

export default withPWA(nextConfig);
