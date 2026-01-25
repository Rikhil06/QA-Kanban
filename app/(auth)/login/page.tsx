'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { SocialLoginButtons } from '@/components/authentication/SocialLoginButtons';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      setToken(data.token);
      await refreshUser();
      router.push('/');
      setIsLoading(false);
    } else {
      setError(data.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-white/95 text-2xl tracking-tight mb-2">
          Welcome back
        </h2>
        <p className="text-white/40">Log in to your account to continue</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )} */}

        <div>
          <label htmlFor="email" className="block text-white/60 text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="test@test.com"
          />
          {/* {errors.email && (
          <p className="mt-2 text-red-400/80 text-sm">{errors.email.message}</p>
        )} */}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-white/60 text-sm">
              Password
            </label>
            <a
              href="#"
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Enter your password"
          />
          {error && <p className="mt-2 text-red-400/80 text-sm">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#1C1C1C] text-white/30">or</span>
        </div>
      </div>

      <SocialLoginButtons />

      <div className="mt-8 text-center">
        <p className="text-white/40 text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-white/70 hover:text-white/90 transition-colors underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
