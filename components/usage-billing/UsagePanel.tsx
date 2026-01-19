import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { Capitalize } from '@/utils/helpers';
import { AlertCircle, Loader, TrendingUp } from 'lucide-react';
import useSWR from 'swr';

interface UsagePanelProps {
  currentPlan: 'free' | 'starter' | 'team' | 'agency';
}

export function UsagePanel({ currentPlan }: UsagePanelProps) {
  const token = getToken();
  const { user } = useUser();
  const { data, isLoading, error } = useSWR(
    token && user?.teamId && user?.team?.subscription?.stripeSubscriptionId
      ? ['team-stats-and-billing', user.teamId, user.team.subscription.stripeSubscriptionId, token]
      : null,
    async ([, teamId, subId, token]) => {
      const [stats, billingDate] = await Promise.all([
        fetcher(`https://qa-backend-105l.onrender.com /api/team/${teamId}/stats`, token),
        fetcher(`https://qa-backend-105l.onrender.com /billing/next-renewal/${subId}/`, token),
      ]);

      return { stats, billingDate };
    }
  );
  if (isLoading) return (
      <div className={`flex items-center justify-center`}>
      <Loader
        size={48}
        className={`animate-spin text-blue-500`}
      />
    </div>
  );
  const usageData = {
    screenshots: { used: data?.stats.screenshotsCount, limit: user?.team.plan === 'team' ? 1000 : user?.team.plan === 'starter' ? 300 : 25 },
    projects: { used: data?.stats.projectsCount, limit: user?.team.plan === 'team' ? 1000 : user?.team.plan === 'starter' ? 5 : 3 },
    teamMembers: { used: data?.stats.teamMembersCount, limit: user?.team.plan === 'team' ? 1000 : user?.team.plan === 'starter' ? 10 : 5 }
  };

  const screenshotPercentage = (usageData.screenshots.used / usageData.screenshots.limit) * 100;
  const projectsPercentage = (usageData.projects.used / usageData.projects.limit) * 100;
  const membersPercentage = (usageData.teamMembers.used / usageData.teamMembers.limit) * 100;

  const isNearingScreenshotLimit = screenshotPercentage > 70;
  const isNearingProjectsLimit = projectsPercentage > 30;
  const isNearingMembersLimit = membersPercentage > 50;


  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A1A] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white">Current Plan & Usage</h3>
        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
          {Capitalize(user?.team.plan)}
        </div>
      </div>

      {/* Screenshot Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Screenshots this month</span>
          <span className="text-sm text-white">
            {usageData.screenshots.used} / {usageData.screenshots.limit}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isNearingScreenshotLimit ? 'bg-linear-to-r from-orange-500 to-red-500' : 'bg-linear-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${screenshotPercentage}%` }}
          />
        </div>
        {isNearingScreenshotLimit && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-orange-400">You&apos;re nearing your screenshot limit</p>
              <p className="text-xs text-white/50 mt-1">
                Upgrade to Starter for 300 screenshots/month
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Projects</span>
          <span className="text-sm text-white">
            {usageData.projects.used} / {usageData.projects.limit ?? '∞'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
            style={{ width: `${projectsPercentage}%` }}
          />
        </div>
        {isNearingProjectsLimit && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-orange-400">You&apos;re nearing your projects limit</p>
              <p className="text-xs text-white/50 mt-1">
                Upgrade to the Starter or Team plan for more screenshots
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Team members</span>
          <span className="text-sm text-white">
            {usageData.teamMembers.used} / {usageData.teamMembers.limit ?? '∞'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#2C2C2C] overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${membersPercentage}%` }}
          />
        </div>
        {isNearingMembersLimit && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-orange-400">You&apos;re nearing your team members limit</p>
              <p className="text-xs text-white/50 mt-1">
                Upgrade to the Starter or Team plan to add more team members
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Renewal Date */}
      <div className="pt-6 border-t border-white/8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Next renewal</span>
          <span className="text-white/80">{data?.billingDate.nextBillingDateFormatted}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 p-4 rounded-lg bg-[#1C1C1C] border border-white/8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white/80">Usage insights</span>
        </div>
        <p className="text-xs text-white/50">
          You&apos;ve used {screenshotPercentage}% of your screenshots this month. {isNearingScreenshotLimit && 'Consider upgrading for unlimited access.'}
        </p>
      </div>
    </div>
  );
}
