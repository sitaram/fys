/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, os: false, tls: false, fs: false,
      child_process: false, perf_hooks: false };
    return config;
  },

  serverTimeout: 30000  // 30 seconds
}

module.exports = nextConfig
