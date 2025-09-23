'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { QAReport } from '@/types/types';
import OpenIssuesCard from '@/components/cards/IssuesCard';
import AvgResolutionTimeCard from '@/components/cards/AvgResolutionTimeCard';
import ReportsThisWeekCard from '@/components/cards/ReportsThisWeekCard';
import SiteList from '@/components/cards/SitesCard';
import InProgressCard from '@/components/cards/InProgressCard';
import ResolvedIssuesCard from '@/components/cards/ResolvedCard';
import { getToken } from '@/lib/auth';

const token = getToken();

console.log(token);

if (!token) {
  window.location.href = '/login'; // or show login modal
}

async function fetchReports(): Promise<QAReport[]> {
  const res = await fetch('http://127.0.0.1:4000/uploads', { headers: { Authorization: `Bearer ${token}` },cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

const reports = await fetchReports();

export default function Page() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <main className='py-15  px-10'>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="text-purple-600">{user.name || user.email}</span>!
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          You have <span className="font-semibold text-gray-900">{reports.length}</span> new issues reported today.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <OpenIssuesCard />
          <InProgressCard />
          <ResolvedIssuesCard />
          <ReportsThisWeekCard />
          <AvgResolutionTimeCard />
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <SiteList />
        </section>
      </div>
    </main>
  );
}
