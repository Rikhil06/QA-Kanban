'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err) {
      setError(
        err === 'access_denied'
          ? 'You cancelled the login. Please try again.'
          : 'Authentication failed. Please try again.',
      );
      return;
    }

    if (token) {
      setToken(token);
      router.replace('/');
    } else {
      setError('No token received. Please try logging in again.');
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-white/95 text-xl tracking-tight mb-2">
          Authentication failed
        </h2>
        <p className="text-white/40 text-sm mb-6">{error}</p>
        <Link
          href="/login"
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors underline underline-offset-2"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-6">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
      <p className="text-white/60 text-sm">Completing sign in...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center text-center py-6">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
