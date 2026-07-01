import { useUser } from '@/context/UserContext';
import { fetcher } from '@/lib/fetcher';
import { Capitalize } from '@/utils/helpers';
import { AlertCircle, Loader, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

// Mirrors PLAN_LIMITS in server.js — null means unlimited
const PLAN_LIMITS: Record<string, { reports: number | null; members: number | null; sites: number | null }> = {
  free:    { reports: 100, members: 5,   sites: 3 },
  starter: { reports: 300, members: 10,  sites: 5 },
  team:    { reports: null, members: null, sites: null },
  agency:  { reports: null, members: null, sites: null },
};

function pct(used: number | undefined, limit: number | null): number {
  if (!used || !limit) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

function fmtLimit(limit: number | null) {
  return limit === null ? '∞' : limit;
}

function nextPlan(plan: string): string {
  const order = ['free', 'starter', 'team', 'agency'];
  const next = order[order.indexOf(plan) + 1];
  return next ? Capitalize(next) : '';
}

export function UsagePanel() {
  const { user } = useUser();
  const plan = (user?.team?.plan ?? 'free').toLowerCase();
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  // Always fetch team stats — works for free users without a subscription
  const { data: stats, isLoading: statsLoading } = useSWR(
    user?.teamId ? ['team-stats', user.teamId] : null,
    ([, teamId]) => fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/team/${teamId}/stats`),
  );

  // Only fetch billing date when a paid subscription exists
  const { data: billingData } = useSWR(
    user?.team?.subscription?.stripeSubscriptionId
      ? ['billing-date', user.team.subscription.stripeSubscriptionId]
      : null,
    ([, subId]) =>
      fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/next-renewal/${subId}`),
  );

  if (statsLoading) {
    return (
      <div className="rounded-xl border border-white/8 bg-[#1A1A1A] p-6 flex items-center justify-center min-h-[200px]">
        <Loader size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const screenshotPct = pct(stats?.screenshotsCount, limits.reports);
  const projectsPct   = pct(stats?.projectsCount,    limits.sites);
  const membersPct    = pct(stats?.teamMembersCount,  limits.members);

  const isNearingScreenshots = limits.reports !== null && screenshotPct > 70;
  const isNearingProjects    = limits.sites    !== null && projectsPct   > 70;
  const isNearingMembers     = limits.members  !== null && membersPct    > 70;

  const upgradeHint = nextPlan(plan) ? (
    <Link href="/usage-billing" className="text-purple-400 hover:text-purple-300 transition-colors">
      Upgrade to {nextPlan(plan)}
    </Link>
  ) : null;

  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A1A] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white">Current Plan & Usage</h3>
        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
          {Capitalize(plan)}
        </div>
      </div>

      {/* Screenshots */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Screenshots this month</span>
          <span className="text-sm text-white">
            {stats?.screenshotsCount ?? 0} / {fmtLimit(limits.reports)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isNearingScreenshots ? 'bg-linear-to-r from-orange-500 to-red-500' : 'bg-linear-to-r from-blue-500 to-purple-500'}`}
            style={{ width: limits.reports === null ? '0%' : `${screenshotPct}%` }}
          />
        </div>
        {isNearingScreenshots && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-400">
              You&apos;re nearing your screenshot limit.{' '}
              {upgradeHint && <>{upgradeHint} for more.</>}
            </p>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Projects</span>
          <span className="text-sm text-white">
            {stats?.projectsCount ?? 0} / {fmtLimit(limits.sites)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
            style={{ width: limits.sites === null ? '0%' : `${projectsPct}%` }}
          />
        </div>
        {isNearingProjects && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-400">
              You&apos;re nearing your project limit.{' '}
              {upgradeHint && <>{upgradeHint} for more.</>}
            </p>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Team members</span>
          <span className="text-sm text-white">
            {stats?.teamMembersCount ?? 0} / {fmtLimit(limits.members)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: limits.members === null ? '0%' : `${membersPct}%` }}
          />
        </div>
        {isNearingMembers && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-400">
              You&apos;re nearing your member limit.{' '}
              {upgradeHint && <>{upgradeHint} to add more.</>}
            </p>
          </div>
        )}
      </div>

      {/* Renewal Date */}
      <div className="pt-6 border-t border-white/8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Next renewal</span>
          <span className="text-white/80">
            {billingData?.nextBillingDateFormatted ?? (plan === 'free' ? '—' : 'Loading…')}
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 rounded-lg bg-[#1C1C1C] border border-white/8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white/80">Usage insights</span>
        </div>
        <p className="text-xs text-white/50">
          {limits.reports === null
            ? 'You have unlimited screenshots on your current plan.'
            : `You've used ${screenshotPct}% of your screenshot allowance this month.${screenshotPct > 70 ? ' Consider upgrading for unlimited access.' : ''}`}
        </p>
      </div>
    </div>
  );
}
