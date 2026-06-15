'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import Link from 'next/link';

type State = 'loading' | 'success' | 'error' | 'unauthenticated';

export default function BoardInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const authToken = getToken();

  const [state, setState] = useState<State>('loading');
  const [siteName, setSiteName] = useState('');
  const [slug, setSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authToken) {
      setState('unauthenticated');
      return;
    }

    const accept = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/board-invite/${token}/accept`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error ?? 'Failed to accept invite');
          setState('error');
        } else {
          setSiteName(data.siteName ?? data.slug);
          setSlug(data.slug);
          setState('success');
          // Auto-redirect after 2.5 s
          setTimeout(() => router.push(`/reports/${data.slug}`), 2500);
        }
      } catch {
        setErrorMsg('Network error — please try again.');
        setState('error');
      }
    };

    accept();
  }, [token, authToken]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <span className="text-white font-semibold tracking-tight">Annoture</span>
        </div>

        <div className="bg-[#111111] border border-white/8 rounded-2xl p-8 text-center shadow-2xl">
          {state === 'loading' && (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
              <h1 className="text-base font-semibold text-white mb-1">Accepting invite…</h1>
              <p className="text-sm text-white/40">Just a moment</p>
            </>
          )}

          {state === 'unauthenticated' && (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/>
                  <path d="m9 11 3 3L22 4"/>
                </svg>
              </div>
              <h1 className="text-base font-semibold text-white mb-1">You&apos;ve been invited</h1>
              <p className="text-sm text-white/40 mb-6">
                Sign in or create an account to access this board.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/login?redirect=/board-invite/${token}`}
                  className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href={`/register?redirect=/board-invite/${token}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/90 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors border border-white/8"
                >
                  Create an account
                </Link>
              </div>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-xl">
                ✓
              </div>
              <h1 className="text-base font-semibold text-white mb-1">You&apos;re in!</h1>
              <p className="text-sm text-white/40 mb-6">
                You now have access to the <span className="text-white/70">{siteName}</span> board.
                Redirecting you now…
              </p>
              <Link
                href={`/reports/${slug}`}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Open board →
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl">
                ✕
              </div>
              <h1 className="text-base font-semibold text-white mb-1">Invite failed</h1>
              <p className="text-sm text-white/40 mb-6">{errorMsg}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white/6 hover:bg-white/10 text-white/70 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors border border-white/8"
              >
                Go home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
