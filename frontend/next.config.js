/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['ui-avatars.com', 'picsum.photos', 'images.unsplash.com'],
  },
  // Disable static generation for pages that use client-side features
  output: 'standalone',
  trailingSlash: false,
}

module.exports = nextConfig