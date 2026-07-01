'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { UsersTasks } from '@/components/cards/UsersTasks';
import { Notifications } from '@/components/cards/Notifications';
import { RecentActivity } from '@/components/cards/RecentActivity';
import { IssueStatusChart } from '@/components/cards/IssueStatusChart';
import { MySites } from '@/components/cards/MySites';
import { AnnotureLoader } from '@/components/AnnotureLoader';

export default function Page() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return <AnnotureLoader className="h-[calc(100vh-64px)]" size="lg" />;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col px-4 lg:px-8 py-4 lg:py-6 h-full">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="flex-[2] min-h-0">
            <UsersTasks />
          </div>
          <div className="flex-[3] grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-0">
            <RecentActivity />
            <IssueStatusChart />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="flex-1 min-h-0">
            <Notifications />
          </div>
          <div className="flex-1 min-h-0">
            <MySites />
          </div>
        </div>
      </div>
    </div>
  );
}
