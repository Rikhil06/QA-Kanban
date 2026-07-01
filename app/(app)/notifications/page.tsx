'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { timeAgo } from '@/utils/helpers';
import useSWR from 'swr';
import {
  Bell,
  AlertTriangle,
  Clock,
  AtSign,
  UserPlus,
  UserCheck,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  report?: { id: string; title: string };
  site?: { slug: string; name: string };
  comment?: { id: string };
};

const iconMap: Record<string, any> = {
  TASK_OVERDUE:   AlertTriangle,
  TASK_DUE_TODAY: Clock,
  MENTION:        AtSign,
  SITE_INVITE:    UserPlus,
  TASK_ASSIGNED:  UserCheck,
};
const iconBgMap: Record<string, string> = {
  TASK_OVERDUE:   'bg-red-500/10',
  TASK_DUE_TODAY: 'bg-amber-500/10',
  MENTION:        'bg-purple-500/10',
  SITE_INVITE:    'bg-blue-500/10',
  TASK_ASSIGNED:  'bg-emerald-500/10',
};
const iconColorMap: Record<string, string> = {
  TASK_OVERDUE:   'text-red-400',
  TASK_DUE_TODAY: 'text-amber-400',
  MENTION:        'text-purple-400',
  SITE_INVITE:    'text-blue-400',
  TASK_ASSIGNED:  'text-emerald-400',
};
const typeLabelMap: Record<string, string> = {
  TASK_OVERDUE:   'Overdue',
  TASK_DUE_TODAY: 'Due today',
  MENTION:        'Mention',
  SITE_INVITE:    'Invite',
  TASK_ASSIGNED:  'Assigned',
};

type Filter = 'all' | 'unread' | 'MENTION' | 'TASK_OVERDUE' | 'TASK_DUE_TODAY' | 'SITE_INVITE' | 'TASK_ASSIGNED';

export default function NotificationsPage() {
  const token = getToken();
  const [filter, setFilter] = useState<Filter>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications` : null,
    fetcher,
    { refreshInterval: 15000 },
  );

  const notifications: Notification[] = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const markRead = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
    mutate();
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });
    await mutate();
    setMarkingAll(false);
  };

  const FILTERS: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Mentions', value: 'MENTION' },
    { label: 'Assigned', value: 'TASK_ASSIGNED' },
    { label: 'Overdue', value: 'TASK_OVERDUE' },
    { label: 'Due today', value: 'TASK_DUE_TODAY' },
    { label: 'Invites', value: 'SITE_INVITE' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-white/35 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/8 disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filter === f.value
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-white/4 border-white/8 text-white/40 hover:text-white/70 hover:bg-white/6'
            }`}
          >
            {f.label}
            {f.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-purple-500/25 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/3 border border-white/6 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-white/30 text-sm">Failed to load notifications</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-5">
            <Bell className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-1">
            {filter === 'all' ? 'No notifications yet' : 'Nothing here'}
          </p>
          <p className="text-sm text-white/25">
            {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const Icon = iconMap[notification.type] ?? Bell;
            const iconBg = iconBgMap[notification.type] ?? 'bg-white/6';
            const iconColor = iconColorMap[notification.type] ?? 'text-white/40';
            const typeLabel = typeLabelMap[notification.type] ?? notification.type;

            // Build a link to the relevant report if available
            const reportLink = notification.report && notification.site
              ? `/reports/${notification.site.slug}?report=${notification.report.id}`
              : notification.report
              ? null
              : null;

            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && markRead(notification.id)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                  !notification.read
                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                    : 'bg-transparent border-white/[0.05] hover:bg-white/[0.02]'
                }`}
              >
                {/* Unread dot */}
                {!notification.read && (
                  <div className="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}

                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${iconBg} ${iconColor}`}>
                      {typeLabel}
                    </span>
                    <span className="text-xs text-white/25">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <p className={`text-sm leading-snug ${!notification.read ? 'text-white/80' : 'text-white/45'}`}>
                    {notification.message}
                  </p>
                  {notification.report?.title && (
                    <p className="text-xs text-white/30 mt-1 truncate">
                      {notification.report.title}
                    </p>
                  )}
                </div>

                {/* Open link */}
                {reportLink && (
                  <Link
                    href={reportLink}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/6 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
