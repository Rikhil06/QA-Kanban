'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { UsersTasks } from '@/components/cards/UsersTasks';
import { Notifications } from '@/components/cards/Notifications';
import { RecentActivity } from '@/components/cards/RecentActivity';
import { IssueStatusChart } from '@/components/cards/IssueStatusChart';
import { MySites } from '@/components/cards/MySites';

const token = getToken();

// if (!token) {
//  redirect("/login"); // or show login modal
// }

// async function fetchReports(): Promise<QAReport[]> {
//   const res = await fetch('https://qa-backend-105l.onrender.com/uploads', { headers: { Authorization: `Bearer ${token}` },cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch reports');
//   return res.json();
// }

// const reports = await fetchReports();

export default function Page() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    // <main className='py-15  px-10'>
    //   <div className="p-6 max-w-6xl mx-auto">
    //     <h1 className="text-5xl font-bold text-gray-200 mb-2">
    //       Welcome back, <span className="text-purple-600">{user.name || user.email}</span>!
    //     </h1>
    //     <p className="text-xl text-gray-400 mb-6">
    //       You have <span className="font-semibold text-gray-200">{reports.length}</span> new issues reported today.
    //     </p>

    //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
    //       <OpenIssuesCard />
    //       <InProgressCard />
    //       <ResolvedIssuesCard />
    //       <ReportsThisWeekCard />
    //       <AvgResolutionTimeCard />
    //     </div>

    //     <section>
    //       <h2 className="text-2xl font-semibold text-gray-200 mb-4">Recent Activity</h2>
    //       <SiteList />
    //     </section>
    //   </div>
    // </main>
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <UsersTasks />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr">
              <RecentActivity />
              <IssueStatusChart />
            </div>
            {/* <MySites />
            <RecentScreenshots /> */}
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            {/* <QuickActions /> */}
            <Notifications />
            <MySites />
            {/* <UpcomingDeadlines />
            <IssueStatusChart />
            <TeamOverview /> */}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* <RecentActivity />
          <UnsortedScreenshots /> */}
        </div>
      </div>
    </div>
  );
}
