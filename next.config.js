/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
  experimental: {
    serverActions: true,
    outputFileTracingRoot: path.join(__dirname, "../"),
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
