/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com', // allow all R2 buckets
      },
      {
        protocol: 'https',
        hostname: 'https://qa-backend-105l.onrender.com', // allow all R2 buckets
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
         {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
    ],
  },
  devIndicators: false,
};

module.exports = nextConfig;
