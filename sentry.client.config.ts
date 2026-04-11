import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 100% of transactions in development; tune down for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Capture 10% of sessions for session replays in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production so local dev stays quiet
  enabled: process.env.NODE_ENV === 'production',

  integrations: [
    Sentry.replayIntegration(),
  ],
});
