import React from 'react';
import { DonationStatus, ClaimStatus } from '../../types';

interface StatusBadgeProps {
  status: DonationStatus | ClaimStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const configMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    reserved: {
      label: 'Reserved',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
    },
    claimed: {
      label: 'Claimed',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
    },
    collected: {
      label: 'Collected',
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-800',
      dot: 'bg-purple-500',
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-green-50 border-green-300',
      text: 'text-green-900',
      dot: 'bg-green-600',
    },
    expired: {
      label: 'Expired',
      bg: 'bg-stone-100 border-stone-200',
      text: 'text-stone-600',
      dot: 'bg-stone-400',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
    },
  };

  const current = configMap[normalized] || {
    label: status.toUpperCase(),
    bg: 'bg-stone-100 border-stone-200',
    text: 'text-stone-700',
    dot: 'bg-stone-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${current.bg} ${current.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
