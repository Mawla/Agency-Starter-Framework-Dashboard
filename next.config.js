/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
  experimental: {
    serverActions: true,
    outputFileTracingIncludes: {
      "/api/projects": ["./cli/tenant.sh"],
    },
  },
  rewrites: async () => [
    {
      source: "/studio/:path*",
      destination: "/studio",
    },
  ],
};

module.exports = nextConfig;
