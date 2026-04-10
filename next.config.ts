// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // webpack config УСТГАЖ, turbopack-ээр солих
  turbopack: {},
};

module.exports = nextConfig;