'use client';

import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { timeAgo } from '@/utils/helpers';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  report: {
    title: string;
  };
  // any other fields you expect from the API
};

export function Notifications() {
  const token = getToken();
  const {
    data: notifications,
    error,
    isLoading,
  } = useSWR(
    token ? [`${process.env.BACKEND_URL}/api/notifications`, token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 10000 },
  );

  async function handleNotificationClick(notificationId: string) {
    await fetch(
      `${process.env.BACKEND_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  }

  const iconMap: Record<string, any> = {
    TASK_OVERDUE: AlertTriangle,
    TASK_DUE_TODAY: Clock,
  };

  const iconBgMap: Record<string, any> = {
    TASK_OVERDUE: 'bg-red-500/10',
    TASK_DUE_TODAY: 'bg-orange-500/10',
  };

  const iconColorMap: Record<string, any> = {
    TASK_OVERDUE: 'text-red-400',
    TASK_DUE_TODAY: 'text-orange-400',
  };

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
          {
            notifications.notifications.filter(
              (n: Notification) => n.read === false,
            ).length
          }{' '}
          new
        </span>
      </div>

      {notifications.notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-300 mb-2">No notifications yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            notifications from your team will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-60 overflow-y-scroll custom-scrollbar pr-2.5">
            {notifications.notifications.map((notification: Notification) => {
              const Icon = iconMap[notification.type];
              const iconBg = iconBgMap[notification.type];
              const iconColor = iconColorMap[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`group relative bg-white/3 border rounded-lg p-3 hover:bg-white/5 transition-all cursor-pointer ${
                    notification.read === false
                      ? 'border-white/10'
                      : 'border-white/5'
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {notification.read === false && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 mb-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {notification.report.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            className="block w-full mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors text-center py-2"
            href="/notifications"
          >
            View all notifications
          </Link>
        </>
      )}
    </div>
  );
}
