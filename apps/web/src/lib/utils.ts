import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeRemaining(deadline?: string | null): { text: string; isUrgent: boolean; isExpired: boolean } {
  if (!deadline) return { text: 'No deadline', isUrgent: false, isExpired: false };
  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) {
    return { text: 'Expired', isUrgent: false, isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return { text: `${minutes}m remaining`, isUrgent: true, isExpired: false };
  }
  if (hours < 4) {
    return { text: `${hours}h ${minutes}m left`, isUrgent: true, isExpired: false };
  }
  return { text: `${hours} hours left`, isUrgent: false, isExpired: false };
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    cooked_meals: 'Cooked Meals',
    bakery: 'Bakery & Bread',
    produce: 'Fresh Produce',
    packaged: 'Packaged Food',
    dairy: 'Dairy Products',
    beverages: 'Beverages',
    other: 'Other Food',
  };
  return map[category] || category;
}
