'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { useUser } from '@/context/UserContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function InvitePage() {
  return (
    <Suspense>
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { refreshUser } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'redirecting'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!code) return;

    const token = getToken();

    if (!token) {
      // Not logged in — save code and send to login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('invite_code', code);
      }
      router.replace(`/login?redirect=/invite/${code}`);
      return;
    }

    // Already logged in — join immediately
    async function joinTeam() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/join`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error ?? 'Failed to join the team.');
          setStatus('error');
          return;
        }

        if (data.teamName) setTeamName(data.teamName);
        setStatus('success');
        await refreshUser();

        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
        setStatus('error');
      }
    }

    joinTeam();
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <h2 className="text-white text-lg mb-2">Joining team...</h2>
            <p className="text-white/40 text-sm">Just a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-white text-lg mb-2">
              {teamName ? `You've joined ${teamName}!` : "You've joined the team!"}
            </h2>
            <p className="text-white/40 text-sm">Redirecting you to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-lg mb-2">Could not join team</h2>
            <p className="text-white/50 text-sm mb-6">{errorMessage}</p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
