import { MessageSquare, UserPlus, CheckCircle2, AlertCircle, GitCommit } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getToken } from '@/lib/auth';
import Link from 'next/link';
import { Capitalize } from '@/utils/helpers';
import { Activity } from '@/types/types';

const iconMap: Record<string, any> = {
  comment: MessageSquare,
  status: GitCommit,
  assignment: UserPlus,
  completed: CheckCircle2,
  created: AlertCircle,
};

export function RecentActivity() {
  const token = getToken();
  const { data: activities, error, isLoading } = useSWR(
    token ? ['http://127.0.0.1:4000/api/activities', token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 10000 }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load activities</div>;
  if (!activities || activities.length === 0) return <div>No activities yet</div>;

  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-1">Recent Activity</h2>
          <p className="text-sm text-gray-500">Latest updates from your team</p>
        </div>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all
        </button>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-scroll custom-scrollbar pr-2.5">
        {activities.map((activity: Activity, index: number) => {
          const Icon = iconMap[activity.type] || AlertCircle;
          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-px h-full bg-white/5 mt-2"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full bg-linear-to-br ${activity.user.color} flex items-center justify-center text-xs shrink-0`}>
                    {activity.user.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 mb-1">
                      <span className="text-white">{activity.user.name}</span>{' '}
                      {activity.action}{' '}
                      <Link href={activity.link} className="text-white">{activity.target}</Link>
                      {activity.status && (
                        <>
                          {' '}to <span className="text-purple-400 font-semibold">{activity.status}</span>
                        </>
                      )}
                      {activity.priority && (
                        <>
                          {' '}to priority <span className="text-red-400 font-semibold">{Capitalize(activity.priority)}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
