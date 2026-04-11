'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      // Always show success to avoid email enumeration
      if (res.ok || res.status === 404) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white/95 text-2xl tracking-tight mb-2">
            Check your email
          </h2>
          <p className="text-white/40 text-sm leading-relaxed">
            If an account exists for <span className="text-white/60">{email}</span>,
            you'll receive a password reset link shortly.
          </p>
        </div>

        <p className="text-white/30 text-xs text-center mb-6">
          Didn't receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSubmitted(false)}
            className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
          >
            try again
          </button>
          .
        </p>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-white/95 text-2xl tracking-tight mb-2">
          Forgot your password?
        </h2>
        <p className="text-white/40 text-sm leading-relaxed">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-white/60 text-sm mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg pl-10 pr-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 w-full text-white/40 hover:text-white/70 text-sm transition-colors mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </>
  );
}
