/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  rewrites: async () => [
    {
      source: "/studio/:path*",
      destination: "/studio",
    },
  ],
};

module.exports = nextConfig;
