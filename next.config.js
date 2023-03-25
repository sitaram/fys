/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, os: false, tls: false, fs: false,
      child_process: false, perf_hooks: false };
    return config;
  },
}

module.exports = nextConfig
