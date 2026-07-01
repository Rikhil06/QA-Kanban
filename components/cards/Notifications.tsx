'use client';

import React from 'react';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { timeAgo } from '@/utils/helpers';
import Link from 'next/link';
import useSWR from 'swr';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  report?: {
    title: string;
  };
};

// ── Icon SVGs inlined so there's no module-resolution uncertainty ──────────
function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
function TriangleAlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function AtSignIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

// ── Lookup helpers ─────────────────────────────────────────────────────────
type IconComponent = (props: { className?: string }) => React.ReactElement;

const ICON_MAP: Record<string, IconComponent> = {
  TASK_OVERDUE:   TriangleAlertIcon,
  TASK_DUE_TODAY: ClockIcon,
  MENTION:        AtSignIcon,
  SITE_INVITE:    UserPlusIcon,
  TASK_ASSIGNED:  UserCheckIcon,
};
const BG_MAP: Record<string, string> = {
  TASK_OVERDUE:   'bg-red-500/10',
  TASK_DUE_TODAY: 'bg-orange-500/10',
  MENTION:        'bg-purple-500/10',
  SITE_INVITE:    'bg-blue-500/10',
  TASK_ASSIGNED:  'bg-emerald-500/10',
};
const COLOR_MAP: Record<string, string> = {
  TASK_OVERDUE:   'text-red-400',
  TASK_DUE_TODAY: 'text-orange-400',
  MENTION:        'text-purple-400',
  SITE_INVITE:    'text-blue-400',
  TASK_ASSIGNED:  'text-emerald-400',
};

function NotificationsSkeleton() {
  return (
    <div className="h-full flex flex-col bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/8 animate-pulse" />
          <div className="h-4 w-28 rounded-md bg-white/8 animate-pulse" />
        </div>
        <div className="h-5 w-14 rounded-full bg-white/5 animate-pulse" />
      </div>
      <div className="flex-1 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded-md bg-white/8 animate-pulse" />
                <div className="h-3 w-1/2 rounded-md bg-white/5 animate-pulse" />
                <div className="h-2.5 w-16 rounded-md bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export function Notifications() {
  const token = getToken();

  const { data, error, isLoading } = useSWR(
    token
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`
      : null,
    fetcher,
    { refreshInterval: 60000 },
  );

  async function handleNotificationClick(id: string) {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${id}/read`,
      { method: 'PATCH', credentials: 'include' },
    );
  }

  if (isLoading) return <NotificationsSkeleton />;
  if (error)     return <div className="h-full rounded-xl border border-white/10 bg-[#1A1A1A] flex items-center justify-center text-sm text-white/30">Failed to load</div>;

  const notifs: Notification[] = Array.isArray(data?.notifications) ? data.notifications : [];
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="h-full flex flex-col bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BellIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-white">Notifications</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">
          {unreadCount} new
        </span>
      </div>

      {/* Content */}
      {notifs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <BellIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-300 mb-2">No notifications yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Notifications from your team will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 custom-scrollbar">
            {notifs.map((notification) => {
              const IconComp: IconComponent = ICON_MAP[notification.type] ?? BellIcon;
              const iconBg    = BG_MAP[notification.type]    ?? 'bg-white/8';
              const iconColor = COLOR_MAP[notification.type] ?? 'text-white/40';

              return (
                <div
                  key={notification.id}
                  className={`group relative bg-white/3 border rounded-lg p-3 hover:bg-white/5 transition-all cursor-pointer ${
                    !notification.read ? 'border-white/10' : 'border-white/5'
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                      <IconComp className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 mb-0.5">{notification.message}</p>
                      {notification.report?.title && (
                        <p className="text-xs text-gray-500 mb-1">{notification.report.title}</p>
                      )}
                      <p className="text-xs text-gray-600">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            className="block w-full mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors text-center py-2 shrink-0"
            href="/notifications"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
