'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { PricingCards } from '@/components/usage-billing/PricingCards';
import { FeatureComparison } from '@/components/usage-billing/FeatureComparison';
import { UsagePanel } from '@/components/usage-billing/UsagePanel';
import { PaymentSection } from '@/components/usage-billing/PaymentSection';
import { TrustBadges } from '@/components/usage-billing/TrustBadges';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';

export default function Page() {
  return (
    <Suspense>
      <UsageBillingContent />
    </Suspense>
  );
}

function UsageBillingContent() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useUser();
  const verified = useRef(false);

  useEffect(() => {
    const sessionId = params.get('session_id');
    if (!sessionId || verified.current) return;
    verified.current = true;

    async function verifySession() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/verify-session?sessionId=${sessionId}`,
          { credentials: 'include' },
        );
        const data = await res.json();
        if (res.ok) {
          await refreshUser();
          toast.success(`🎉 You're now on the ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan!`);
        } else {
          toast.error(data.error ?? 'Could not verify subscription');
        }
      } catch {
        toast.error('Could not verify subscription');
      } finally {
        // Clean the session_id from the URL
        router.replace('/usage-billing', { scroll: false });
      }
    }

    verifySession();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
            <div className="mb-16">
            <div className="text-center">
                <h1 className="text-white mb-3">Plans & Billing</h1>
                <p className="text-white/60">Choose a plan that fits how you work.</p>
            </div>
            </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-[#1C1C1C] border border-white/8">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <PricingCards billingPeriod={billingPeriod} />
          <FeatureComparison />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
            <UsagePanel />
            <PaymentSection />
          </div>

          <TrustBadges />
        </div>
      </main>
    </div>
  );
}
