import { Check } from 'lucide-react';
import UpgradeButton from '../stripe/UpgradeButton';
import { useUser } from '@/context/UserContext';
import { Capitalize } from '@/utils/helpers';

interface PricingCardsProps {
  billingPeriod: 'monthly' | 'yearly';
  onUpgrade: (plan: 'free' | 'starter' | 'team' | 'agency') => void;
}

export function PricingCards({ billingPeriod, onUpgrade }: PricingCardsProps) {
  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      tag: 'Great for trying it out',
      color: 'from-green-500 to-emerald-500',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '3 projects / boards',
        '5 team members',
        '25 screenshots per month',
        'Basic annotations & comments',
        '7-day retention',
      ],
      highlighted: false,
    },
    {
      id: 'starter' as const,
      name: 'Starter',
      tag: 'Best for freelancers',
      color: 'from-blue-500 to-cyan-500',
      monthlyPrice: 12,
      yearlyPrice: 144,
      features: [
        '5 projects / boards',
        '10 team members',
        '300 screenshots per month',
        'Unlimited comments',
        '90-day retention',
      ],
      highlighted: false,
    },
    {
      id: 'team' as const,
      name: 'Team',
      tag: 'Best value',
      color: 'from-purple-500 to-pink-500',
      monthlyPrice: 39,
      yearlyPrice: 468,
      features: [
        'Unlimited projects',
        'Unlimited team members',
        'Unlimited screenshots',
        'Long-term storage',
        'Priority processing',
        'Board-level permissions',
      ],
      highlighted: true,
    },
    {
      id: 'agency' as const,
      name: 'Agency',
      tag: 'Coming soon',
      color: 'from-orange-500 to-red-500',
      monthlyPrice: null,
      yearlyPrice: null,
      features: [
        'White labelling',
        'Client-specific boards',
        'Exports (PDF, Jira, Trello)',
        'SSO',
        'Custom retention',
      ],
      highlighted: false,
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === null) return null;
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const { user } = useUser();

  function getStripePriceId(
    plan: 'free' | 'starter' | 'team' | 'agency',
    billingPeriod: 'monthly' | 'yearly',
  ) {
    const env = process.env;

    const priceMap = {
      free: {
        monthly: env.NEXT_PUBLIC_STRIPE_FREE_MONTHLY_PRICE,
        yearly: env.NEXT_PUBLIC_STRIPE_FREE_YEARLY_PRICE,
      },
      starter: {
        monthly: env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE,
        yearly: env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE,
      },
      team: {
        monthly: env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE,
        yearly: env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE,
      },
      agency: {
        monthly: null,
        yearly: null,
      },
    } as const;

    return priceMap[plan]?.[billingPeriod] ?? null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
      {plans.map((plan) => {
        const isCurrentPlan = user?.team.plan === plan.id;
        const price = getPrice(plan);

        return (
          <div
            key={plan.id}
            className={`relative rounded-xl border ${isCurrentPlan && 'border-white/15 shadow-xl shadow-indigo-500/8'} transition-all ${
              plan.highlighted
                ? 'bg-[#1C1C1C] border-white/12 scale-105'
                : 'bg-[#1A1A1A] border-white/8 hover:border-white/12'
            }`}
          >
            {/* Gradient Border Effect */}
            {plan.highlighted && (
              <div
                className={`absolute inset-0 rounded-xl bg-linear-to-b ${plan.color} opacity-5`}
              />
            )}

            <div className="relative p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white">{plan.name}</h3>
                  {isCurrentPlan && (
                    <div
                      className={`w-2 h-2 rounded-full bg-linear-to-r ${plan.color}`}
                    />
                  )}
                </div>
                <p className="text-xs text-white/50">{plan.tag}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {price !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white opacity-60">£</span>
                      <span className="text-4xl text-white">{price}</span>
                      <span className="text-white/50 text-sm">
                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-xs text-white/40 mt-1">
                        £{Math.round(price / 12)}/month billed yearly
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-white/60">Custom</div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <button className="w-full py-2.5 rounded-lg bg-[#2C2C2C] border border-white/8 text-white/60 text-sm">
                  Current Plan
                </button>
              ) : plan.id === 'agency' ? (
                <button className="w-full py-2.5 rounded-lg bg-[#2C2C2C] border border-white/8 text-white/60 text-sm">
                  Join Waitlist
                </button>
              ) : (
                <UpgradeButton
                  onClick={() => onUpgrade(plan.id)}
                  teamId={user?.teamId}
                  priceId={getStripePriceId(plan.id, billingPeriod)!}
                  planName={plan.name}
                  className={`w-full py-2.5 rounded-lg text-sm transition-all ${plan.highlighted ? 'bg-white text-[#0F0F0F] hover:bg-white/90' : 'bg-[#2C2C2C] text-white hover:bg-[#333] border border-white/8'}`}
                  disabled={isCurrentPlan && true}
                  currentPlan={Capitalize(user?.team?.plan) ?? 'Free'}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
