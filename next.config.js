/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CLERK_DEBUG: true
  }
}

module.exports = nextConfig

