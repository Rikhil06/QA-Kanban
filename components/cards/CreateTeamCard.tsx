'use client';

import React, { useState } from 'react';
import { Users, Upload, X, Check, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface CreateTeamCardProps {
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
  onReset: () => void;
}

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '£0',
    period: '/mo',
    tag: 'Great for trying it out',
    priceId: null,
    features: ['3 projects / boards', '5 team members', '100 screenshots / mo', 'Basic annotations', '7-day retention'],
    disabled: false,
    badge: null,
  },
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '£15',
    period: '/mo',
    tag: 'Best for freelancers',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE,
    features: ['5 projects / boards', '10 team members', '300 screenshots / mo', 'Unlimited comments', '90-day retention'],
    disabled: false,
    badge: null,
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: '£39',
    period: '/mo',
    tag: 'Best value',
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE,
    features: ['Unlimited projects', 'Unlimited members', 'Unlimited screenshots', 'Long-term storage', 'Board-level permissions'],
    disabled: false,
    badge: 'Most popular',
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    price: 'Custom',
    period: '',
    tag: 'Coming soon',
    priceId: null,
    features: ['White labelling', 'Client-specific boards', 'Exports (PDF, Jira, Trello)', 'SSO', 'Custom retention'],
    disabled: true,
    badge: null,
  },
] as const;

type PlanId = typeof PLANS[number]['id'];

export function CreateTeamCard({
  isSelected,
  isOtherSelected,
  onSelect,
  onReset,
}: CreateTeamCardProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const token = getToken();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      // Step 1: always create the team as free
      const formData = new FormData();
      formData.append('name', teamName.trim());
      if (logoFile) formData.append('logo', logoFile);

      const createRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/create`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(createData.error || 'Failed to create team');
        setIsLoading(false);
        return;
      }

      const teamId = createData.team?.id;

      // Step 2: if a paid plan was chosen, redirect to Stripe checkout
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (plan?.priceId && teamId) {
        const checkoutRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/checkout`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ teamId, priceId: plan.priceId }),
          },
        );
        const checkoutData = await checkoutRes.json();

        if (!checkoutRes.ok) {
          setError(checkoutData.error || 'Failed to start checkout');
          setIsLoading(false);
          return;
        }

        if (checkoutData.url) {
          try {
            const url = new URL(checkoutData.url);
            if (url.hostname === 'checkout.stripe.com' || url.hostname === 'billing.stripe.com') {
              window.location.href = checkoutData.url;
              return;
            }
          } catch {
            setError('Invalid checkout URL received');
            setIsLoading(false);
            return;
          }
        }
      }

      // Free plan or fallback: go to dashboard
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (isOtherSelected) return null;

  return (
    <div
      onClick={!isSelected ? onSelect : undefined}
      className={`relative bg-[#1A1A1A]/60 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
        isSelected
          ? 'border-[#4A9EFF]/60 shadow-[0_0_30px_rgba(74,158,255,0.15)]'
          : 'border-[#2A2A2A] hover:border-[#4A9EFF]/40 hover:shadow-[0_0_20px_rgba(74,158,255,0.08)] cursor-pointer'
      }`}
    >
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute top-4 right-4 z-10 text-[#A6A6A6] hover:text-[#E6E6E6] transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <div className="p-8">
        {/* Header */}
        <div className={`flex items-start gap-4 ${isSelected ? 'mb-6' : ''}`}>
          <div className="p-3 bg-[#4A9EFF]/10 rounded-lg">
            <Users className="text-[#4A9EFF]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#E6E6E6] mb-2">Create a New Team</h3>
            <p className="text-[#A6A6A6] text-sm">Set up a new workspace for your company or project.</p>
          </div>
        </div>

        {isSelected && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-2">Team / Company Name *</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Acme Inc"
                required
                className="w-full px-4 py-3 bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg text-[#E6E6E6] placeholder-[#666] focus:outline-none focus:border-[#4A9EFF] transition-colors"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-2">Team Logo (optional)</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-[#0E0E0E] border-2 border-dashed border-[#2A2A2A] flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-[#666]" />
                  )}
                </div>
                <label className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] rounded-lg text-[#E6E6E6] text-sm cursor-pointer transition-colors">
                  Choose File
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoFile && (
                  <span className="text-[#A6A6A6] text-sm truncate max-w-[160px]">{logoFile.name}</span>
                )}
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-3">Choose a Plan</label>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => {
                  const isActive = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      disabled={plan.disabled}
                      onClick={() => !plan.disabled && setSelectedPlan(plan.id)}
                      className={`relative text-left p-4 rounded-xl border transition-all ${
                        plan.disabled
                          ? 'opacity-40 cursor-not-allowed border-[#2A2A2A] bg-[#0E0E0E]'
                          : isActive
                          ? 'border-[#4A9EFF] bg-[#4A9EFF]/8 shadow-[0_0_16px_rgba(74,158,255,0.12)]'
                          : 'border-[#2A2A2A] bg-[#0E0E0E] hover:border-[#4A9EFF]/40'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium text-purple-300 bg-purple-500/15 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                          <Zap size={9} />
                          {plan.badge}
                        </span>
                      )}
                      {isActive && !plan.badge && (
                        <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#4A9EFF] flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </span>
                      )}
                      <div className="mb-2">
                        <span className="text-[#E6E6E6] font-semibold text-sm">{plan.name}</span>
                        <p className="text-[#666] text-[11px] mt-0.5">{plan.tag}</p>
                      </div>
                      <div className="flex items-baseline gap-0.5 mb-3">
                        <span className="text-[#E6E6E6] text-lg font-bold">{plan.price}</span>
                        {plan.period && <span className="text-[#666] text-xs">{plan.period}</span>}
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-[#A6A6A6] text-[11px]">
                            <Check size={10} className="text-[#4A9EFF] shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !teamName.trim()}
              className="w-full px-6 py-3 bg-[#4A9EFF] hover:bg-[#3B8FEF] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading
                ? selectedPlan === 'free'
                  ? 'Creating team...'
                  : 'Redirecting to payment...'
                : selectedPlan === 'free'
                ? 'Create Team'
                : `Create Team & Pay with Stripe`}
            </button>

            {selectedPlan !== 'free' && (
              <p className="text-center text-[#666] text-xs">
                Your team is created first, then you'll complete payment via Stripe.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
