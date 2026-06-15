import { withSentryConfig } from '@sentry/nextjs';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  // Bundle OpenTelemetry packages rather than treating them as server-external.
  // Without this, Next.js looks for require-in-the-middle / import-in-the-middle
  // as top-level packages, which fails with pnpm's strict hoisting.
  serverExternalPackages: [],
  headers: async () => [
    // Security headers on every response
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    // Immutable cache for Next.js compiled assets (content-hashed filenames)
    {
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    // Short cache for the favicon
    {
      source: '/favicon.ico',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400' },
      ],
    },
    // Never cache API routes — they're dynamic and auth-gated
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'qa-backend-105l.onrender.com',
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Suppress the Sentry CLI output during builds
  silent: !process.env.CI,
  // Upload source maps to Sentry for readable stacktraces
  widenClientFileUpload: true,
  // Automatically instrument server components
  autoInstrumentServerFunctions: true,
  // Disable Sentry telemetry
  telemetry: false,
});
