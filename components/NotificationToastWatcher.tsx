'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { useUser } from '@/context/UserContext';
import { showDesktopNotification } from '@/lib/desktopNotifications';

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  TASK_OVERDUE: 'Overdue',
  TASK_DUE_TODAY: 'Due today',
  MENTION: 'Mention',
  SITE_INVITE: 'Invite',
  TASK_ASSIGNED: 'Assigned',
};

const MAX_INDIVIDUAL_TOASTS = 3;

function ToastBody({ item }: { item: NotificationItem }) {
  const label = TYPE_LABEL[item.type] ?? null;
  const content = (
    <div>
      {label && <p className="text-xs text-white/40 mb-0.5">{label}</p>}
      <p className="text-sm">{item.message}</p>
    </div>
  );

  if (!item.link) return content;

  return (
    <Link href={item.link} className="block">
      {content}
    </Link>
  );
}

export function NotificationToastWatcher() {
  const token = getToken();
  const { user, setLastSeenNotificationsAt } = useUser();
  const toastedIdsRef = useRef<Set<string>>(new Set());

  const { data } = useSWR(
    token
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`
      : null,
    fetcher,
    { refreshInterval: 60000 },
  );

  useEffect(() => {
    if (!user || !data?.notifications) return;

    const lastSeen = user.lastSeenNotificationsAt
      ? new Date(user.lastSeenNotificationsAt)
      : null;

    const unseen: NotificationItem[] = data.notifications.filter(
      (n: NotificationItem) =>
        !n.read &&
        (!lastSeen || new Date(n.createdAt) > lastSeen) &&
        !toastedIdsRef.current.has(n.id),
    );

    if (unseen.length === 0) return;

    unseen.forEach((n) => toastedIdsRef.current.add(n.id));

    const toShow = unseen.slice(0, MAX_INDIVIDUAL_TOASTS);
    toShow.forEach((item) => {
      toast.info(<ToastBody item={item} />);
      showDesktopNotification(TYPE_LABEL[item.type] ?? 'Annoture', {
        body: item.message,
        icon: '/icon.svg',
        tag: item.id,
        onClick: () => {
          if (item.link) window.location.href = item.link;
        },
      });
    });

    const remaining = unseen.length - toShow.length;
    if (remaining > 0) {
      toast.info(`+${remaining} more notification${remaining === 1 ? '' : 's'}`);
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-seen`,
          { method: 'POST', credentials: 'include' },
        );
        if (res.ok) {
          const result = await res.json();
          if (result.lastSeenNotificationsAt) {
            setLastSeenNotificationsAt(result.lastSeenNotificationsAt);
          }
        }
      } catch {
        // non-critical — next poll will retry with the same unseen set
      }
    })();
  }, [data, user, setLastSeenNotificationsAt]);

  return null;
}
