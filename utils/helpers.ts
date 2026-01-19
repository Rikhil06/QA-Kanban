import { formatDistanceToNow } from 'date-fns';

export const Capitalize = (s: string | undefined) => (s && String(s[0]).toUpperCase() + String(s).slice(1)) || "";

export const getInitials = (fullName: string): string => {
  if (!fullName) return "";

  const names = fullName.trim().split(" ");
  const initials = names.map(name => name[0].toUpperCase()).join("");

  return initials;
};

export const timeAgo = (date: string | Date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'not_assigned':
      return 'bg-sky-500';
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-orange-500';
    case 'high':
      return 'bg-red-500';
    case 'urgent':
      return 'bg-red-600';
    default:
      return 'bg-gray-500'; // fallback
  }
}

export const formatFriendlyDate = (iso: string) => {
  const d = new Date(iso);
  const day = d.getUTCDate();

  const ordinal =
    day > 3 && day < 21
      ? 'th'
      : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';

  return `${d.toLocaleDateString('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  })}, ${d.toLocaleDateString('en-GB', {
    month: 'short',
    timeZone: 'UTC',
  })} ${day}${ordinal}`;
};

export const normalizeStatus = (status: string) => {
        switch (status) {
            case 'new': return 'New';
            case 'inProgress': return 'In Progress';
            case 'done': return 'Done';
            default: return status;
        }
    };
