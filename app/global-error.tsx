'use client';

// global-error.tsx catches errors thrown inside the root layout (app/layout.tsx).
// It replaces the entire page, so it must include <html> and <body>.
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#121212] flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center text-center px-4">
          <h2 className="text-white text-xl mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-6">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
