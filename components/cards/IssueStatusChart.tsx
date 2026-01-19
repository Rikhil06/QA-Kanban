'use client';

import { getToken } from '@/lib/auth';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { StatusData } from '@/types/types';

type Issue = {
  value: number;
  color: string;
};


export function IssueStatusChart() {
    const token = getToken();
    const { data: issuesSummary, isLoading } = useSWR(token ? ['https://qa-backend-105l.onrender.com /api/stats/issues-summary', token] : null, ([url, token]) => fetcher(url, token));
    
    if (isLoading) return <p className="text-white">Loading...</p>;
    const total = issuesSummary.reduce((sum: number, item: Issue) => sum + item.value, 0);
    
  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-white mb-1">Issue Status</h2>
        <p className="text-sm text-gray-500">{total} total issues</p>
      </div>
      
      <div className="relative h-48 mb-6">
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
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
