'use client';

import { getToken, setToken } from '@/lib/auth';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

const PASSWORD_RULES = [
  { label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',   test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)',   test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)',             test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function RegisterPage() {
  const [email, setEmail]                       = useState('');
  const [emailError, setEmailError]             = useState('');
  const [password, setPassword]                 = useState('');
  const [passwordTouched, setPasswordTouched]   = useState(false);
  const [showPassword, setShowPassword]         = useState(false);
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [confirmTouched, setConfirmTouched]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName]                         = useState('');
  const [isLoading, setIsLoading]               = useState(false);
  const [registerError, setRegisterError]       = useState<string | null>(null);
  const [inviteCode, setInviteCode]             = useState<string | null>(null);
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect');
  const { refreshUser } = useUser();

  useEffect(() => {
    if (getToken()) router.replace(redirectTo ?? '/');
    if (typeof window !== 'undefined') {
      setInviteCode(localStorage.getItem('invite_code'));
    }
  }, []);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const confirmMatch  = confirmPassword === password;

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!passwordValid) {
      setPasswordTouched(true);
      return;
    }
    if (!confirmMatch) {
      setConfirmTouched(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, name }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setRegisterError(data.error || 'Registration failed');
        return;
      }

      setToken(data.token);
      await refreshUser();

      if (redirectTo) {
        router.push(redirectTo);
      } else if (inviteCode) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
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
      setRegisterError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = ['1 project', '25 screenshots / month', 'Cancel anytime'];

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
        {registerError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {registerError}
          </div>
        )}

        {/* Full Name */}
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
            className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-white/80 text-sm mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
            onBlur={handleEmailBlur}
            value={email}
            placeholder="you@example.com"
            required
            className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all ${emailError ? 'border-red-500/60' : 'border-white/10'}`}
          />
          {emailError && (
            <p className="mt-1.5 text-xs text-red-400">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-white/80 text-sm mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
              className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all pr-12 ${passwordTouched && !passwordValid ? 'border-red-500/60' : 'border-white/10'}`}
              placeholder="Create a strong password"
              autoComplete="new-password"
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

          {/* Password strength checklist */}
          {passwordTouched && (
            <ul className="mt-2.5 space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li key={rule.label} className="flex items-center gap-2">
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/25'}`}>
                      {passed ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                    </span>
                    <span className={`text-xs ${passed ? 'text-green-400' : 'text-white/40'}`}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-white/80 text-sm mb-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
              className={`w-full bg-[#222] border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all pr-12 ${confirmTouched && !confirmMatch ? 'border-red-500/60' : 'border-white/10'}`}
              placeholder="Re-enter your password"
              autoComplete="new-password"
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
          {confirmTouched && !confirmMatch && (
            <p className="mt-1.5 text-xs text-red-400">Passwords do not match.</p>
          )}
        </div>

        {/* Submit */}
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
            <div key={index} className="flex items-center gap-1.5 text-white/50 text-xs">
              <Check size={14} className="text-green-500/70" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/40 text-xs text-center mt-6">
        By signing up, you agree to our{' '}
        <a href="https://annoture.com/terms" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="https://annoture.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-white/60 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-white hover:text-white/80 transition-colors">
          Log in
        </Link>
      </p>
    </>
  );
}
