'use client';

import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { timeAgo } from '@/utils/helpers';
import { Bell, AlertTriangle, UserPlus, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

// const notifications = [
//   {
//     id: 1,
//     type: 'mention',
//     title: 'Sarah mentioned you',
//     description: 'In "Fix navigation issue"',
//     time: '5 min ago',
//     icon: MessageCircle,
//     iconColor: 'text-blue-400',
//     iconBg: 'bg-blue-500/10',
//     unread: true,
//   },
//   {
//     id: 2,
//     type: 'overdue',
//     title: '2 tasks overdue',
//     description: 'Payment gateway & API docs',
//     time: 'Today',
//     icon: AlertTriangle,
//     iconColor: 'text-red-400',
//     iconBg: 'bg-red-500/10',
//     unread: true,
//   },
//   {
//     id: 3,
//     type: 'assignment',
//     title: 'New assignment',
//     description: 'Mike assigned you a task',
//     time: '1 hour ago',
//     icon: UserPlus,
//     iconColor: 'text-green-400',
//     iconBg: 'bg-green-500/10',
//     unread: true,
//   },
//   {
//     id: 4,
//     type: 'due',
//     title: '3 tasks due today',
//     description: 'Mobile nav, Payment, Auth',
//     time: 'Today',
//     icon: Clock,
//     iconColor: 'text-orange-400',
//     iconBg: 'bg-orange-500/10',
//     unread: false,
//   },
// ];

// {
//     "id": "overdue-cmk5n1lmp000fvav3sl10zsav",
//     "type": "TASK_OVERDUE",
//     "message": "Task \"Change the order of these logos\" is overdue",
//     "createdAt": "2026-01-10T00:00:00.000Z",
//     "report": {
//         "id": "cmk5n1lmp000fvav3sl10zsav",
//         "title": "Change the order of these logos",
//         "dueDate": "2026-01-10T00:00:00.000Z",
//         "siteName": "Rikhil Makwana - Portfolio"
//     },
//     "link": "/reports/rikhil makwana - portfolio?report=cmk5n1lmp000fvav3sl10zsav"
// }

export function Notifications() {
    const token = getToken();
    const { data: notifications, error, isLoading } = useSWR(
      token ? ['https://qa-backend-105l.onrender.com /api/notifications', token] : null,
      ([url, token]) => fetcher(url, token),
      { refreshInterval: 10000 }
    );

    async function handleNotificationClick(notificationId: string) {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const iconMap: Record<string, any> = {
      TASK_OVERDUE: AlertTriangle,
      TASK_DUE_TODAY: Clock
    };

    const iconBgMap: Record<string, any> = {
      TASK_OVERDUE: 'bg-red-500/10',
      TASK_DUE_TODAY: 'bg-orange-500/10'
    }

    const iconColorMap: Record<string, any> = {
      TASK_OVERDUE: 'text-red-400',
      TASK_DUE_TODAY: 'text-orange-400'
    }


    // isLoading &&  <p>Loading...</p>;
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Failed to load activities</div>;

  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-400" />
          <h2 className="text-white">Notifications</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">
          {notifications.notifications.filter(n => n.read === false ).length} new
        </span>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-scroll custom-scrollbar pr-2.5">
        {notifications.notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          const iconBg = iconBgMap[notification.type];
          const iconColor = iconColorMap[notification.type];
          return (
            <div
              key={notification.id}
              className={`group relative bg-white/3 border rounded-lg p-3 hover:bg-white/5 transition-all cursor-pointer ${
                notification.read === false ? 'border-white/10' : 'border-white/5'
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              {notification.read === false && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 mb-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-500 mb-1">{notification.report.title}</p>
                  <p className="text-xs text-gray-600">{timeAgo(notification.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Link className="block w-full mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors text-center py-2" href="/notifications">
        View all notifications
      </Link>
    </div>
  );
}
