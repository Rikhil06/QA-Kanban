'use client';

import { useState } from 'react';

import { PricingCards } from '@/components/usage-billing/PricingCards';
import { FeatureComparison } from '@/components/usage-billing/FeatureComparison';
import { UsagePanel } from '@/components/usage-billing/UsagePanel';
import { PaymentSection } from '@/components/usage-billing/PaymentSection';
import { TrustBadges } from '@/components/usage-billing/TrustBadges';

export default function Page() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'starter' | 'team' | 'agency'>('free');

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Main Content */}
      <main className="ml-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="mb-16">

            {/* Page Title */}
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

          {/* Pricing Cards */}
          <PricingCards 
            billingPeriod={billingPeriod} 
            onUpgrade={(plan) => setCurrentPlan(plan)}
          />

          {/* Feature Comparison */}
          <FeatureComparison />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
            <UsagePanel currentPlan={currentPlan} />
            <PaymentSection />
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </main>
    </div>
  );
}
