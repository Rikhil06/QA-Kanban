'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { Mail, X } from 'lucide-react';

export function VerificationBanner() {
  const { user } = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Don't show if verified, not loaded, or dismissed
  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-verification`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to resend');
        return;
      }
      toast.success('Verification email sent — check your inbox');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-sm">
      <div className="flex items-center gap-2 text-amber-300">
        <Mail className="w-4 h-4 shrink-0" />
        <span>
          Please verify your email address.{' '}
          <button
            onClick={handleResend}
            disabled={sending}
            className="underline underline-offset-2 hover:text-amber-200 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Sending…' : 'Resend verification email'}
          </button>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/60 hover:text-amber-300 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
