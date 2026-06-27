const STORAGE_KEY = 'desktopNotificationsEnabled';

export function isDesktopNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserPermission(): NotificationPermission | null {
  if (!isDesktopNotificationsSupported()) return null;
  return Notification.permission;
}

export function isDesktopNotificationsEnabled(): boolean {
  if (!isDesktopNotificationsSupported()) return false;
  return Notification.permission === 'granted' && localStorage.getItem(STORAGE_KEY) === 'true';
}

export async function enableDesktopNotifications(): Promise<{ success: boolean; permission: NotificationPermission }> {
  if (!isDesktopNotificationsSupported()) {
    return { success: false, permission: 'denied' };
  }
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem(STORAGE_KEY, 'true');
    return { success: true, permission };
  }
  localStorage.removeItem(STORAGE_KEY);
  return { success: false, permission };
}

export function disableDesktopNotifications(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function showDesktopNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void },
): void {
  if (!isDesktopNotificationsEnabled()) return;
  try {
    const notif = new Notification(title, options);
    if (options?.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }
  } catch {
    // Notification constructor can throw in some contexts (e.g. service worker
    // restrictions on mobile) — fail silently since this is a non-critical feature.
  }
}
