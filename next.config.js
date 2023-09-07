/** @type {import('next').NextConfig} */

const nextConfig = {
  rewrites: async () => [
    {
      source: "/studio/:path*",
      destination: "/studio",
    },
  ],
};

module.exports = nextConfig;
