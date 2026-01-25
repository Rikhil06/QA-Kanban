'use client';

import { setToken } from '@/lib/auth';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteCode(localStorage.getItem('invite_code'));
    }
  }, []);

  const features = ['1 project', '25 screenshots / month', 'Cancel anytime'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        await refreshUser();
        router.push('/');
        setIsLoading(false);
      } else {
        alert(data.error || 'Login failed');
        setIsLoading(false);
      }

      if (inviteCode) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: inviteCode }),
        });

        localStorage.removeItem('invite_code');
        router.push('/');
      } else {
        router.push('/onboarding/team');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-white/95 text-2xl tracking-tight mb-2">
          Start tracking issues in seconds.
        </h2>
        <p className="text-white/40">
          Capture feedback, annotate screenshots, and ship faster.
        </p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        {/* {errors.general && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {errors.general}
        </div>
      )} */}

        <div>
          <label htmlFor="name" className="block text-white/80 text-sm mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Jane Doe"
            required
            className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`}
          />
          {/* {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )} */}
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-white/80 text-sm mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="test@test.com"
            required
            className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`}
          />
          {/* {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )} */}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-white/80 text-sm mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all pr-12`}
              placeholder="At least 8 characters"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )} */}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-white/80 text-sm mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all pr-12`}
              placeholder="Re-enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* {errors.confirmPassword && (
          <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
        )} */}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg px-4 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/8">
        <p className="text-white/60 text-sm text-center mb-3">
          Free plan included. No credit card required.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 text-white/50 text-xs"
            >
              <Check size={14} className="text-green-500/70" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/40 text-xs text-center mt-6">
        By signing up, you agree to our{' '}
        <a
          href="#"
          className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors"
        >
          Terms
        </a>{' '}
        and{' '}
        <Link
          href="/privacy-policy"
          className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {/* Secondary Action */}
      <p className="text-white/60 text-sm text-center mt-6">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-white hover:text-white/80 transition-colors"
        >
          Log in
        </a>
      </p>
    </>
  );
}
