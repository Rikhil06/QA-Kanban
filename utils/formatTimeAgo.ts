// utils/formatTimeAgo.ts
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    const remainingMins = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMins > 0 ? ` and ${remainingMins} min${remainingMins !== 1 ? 's' : ''}` : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}
