/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
  experimental: {
    serverActions: true,
    outputFileTracingRoot: path.join(__dirname, "../"),
  },
  rewrites: async () => [
    {
      source: "/studio/:path*",
      destination: "/studio",
    },
  ],
};

module.exports = nextConfig;
