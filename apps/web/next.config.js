/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['codeempty-images.r2.cloudflarestorage.com', 'codeempty-images.codeempty.com'],
  },
};

module.exports = nextConfig;
