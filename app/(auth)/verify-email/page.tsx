'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('No verification token found.');
      return;
    }

    // The backend redirects to /login?verified=1 on success, but if the token
    // is invalid/expired it returns JSON — handle both cases.
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // Backend redirected to /login?verified=1 — treat as success
          setState('success');
          setTimeout(() => router.push('/login?verified=1'), 2000);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setState('error');
          setMessage(data.error || 'Verification failed.');
        } else {
          setState('success');
          setTimeout(() => router.push('/login?verified=1'), 2000);
        }
      })
      .catch(() => {
        setState('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] px-4 text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-white/60 text-sm">Verifying your email…</p>
        </>
      )}

      {state === 'success' && (
        <>
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
          <h1 className="text-white text-xl font-medium mb-2">Email verified!</h1>
          <p className="text-white/50 text-sm mb-6">Redirecting you to login…</p>
        </>
      )}

      {state === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-red-400 mb-4" />
          <h1 className="text-white text-xl font-medium mb-2">Verification failed</h1>
          <p className="text-white/50 text-sm mb-6">{message}</p>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}
