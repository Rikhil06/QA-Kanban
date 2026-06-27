'use client';

import { getToken } from '@/lib/auth';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { StatusData } from '@/types/types';
import { useUser } from '@/context/UserContext';

type Issue = {
  value: number;
  color: string;
};

function IssueStatusChartSkeleton() {
  return (
    <div className="h-full flex flex-col bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-24 rounded-md bg-white/8 animate-pulse" />
        <div className="h-3 w-28 rounded-md bg-white/5 animate-pulse" />
      </div>

      <div className="relative flex-1 min-h-0 mb-4 flex items-center justify-center">
        <div className="w-[140px] h-[140px] rounded-full border-[16px] border-white/8 animate-pulse" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/8 animate-pulse" />
              <div className="h-3 w-16 rounded-md bg-white/5 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-4 rounded-md bg-white/5 animate-pulse" />
              <div className="h-3 w-8 rounded-md bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IssueStatusChart() {
  const token = getToken();
  const { user } = useUser();
  const teamId = user?.teamId;
  const { data: issuesSummary, isLoading } = useSWR(
    token && teamId !== undefined
      ? [
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/issues-summary?teamId=${teamId ?? ''}`,
          token,
          teamId,
        ]
      : null,
    ([url, token]) => fetcher(url, token),
  );

  if (isLoading) return <IssueStatusChartSkeleton />;
  if (!issuesSummary) return null;
  const total = issuesSummary.reduce(
    (sum: number, item: Issue) => sum + item.value,
    0,
  );

  return (
    <div className="h-full flex flex-col bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-white mb-1">Issue Status</h2>
        <p className="text-sm text-gray-500">{total} total issues</p>
      </div>

      <div className="relative flex-1 min-h-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={issuesSummary}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {issuesSummary.map((entry: Issue, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl text-white">{total}</div>
            <div className="text-xs text-gray-500">Issues</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {issuesSummary.map((item: StatusData) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-400">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{item.value}</span>
              <span className="text-xs text-gray-600 w-12 text-right">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
