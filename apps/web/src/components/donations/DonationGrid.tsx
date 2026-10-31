import React from 'react';
import { Donation } from '../../types';
import { DonationCard } from './DonationCard';
import { EmptyState } from '../common/EmptyState';
import { Utensils } from 'lucide-react';

interface DonationGridProps {
  donations: Donation[];
  emptyMessage?: string;
  onDelist?: (donation: Donation) => void;
}

export const DonationGrid: React.FC<DonationGridProps> = ({
  donations,
  emptyMessage = 'No food donations match your current filter criteria.',
  onDelist,
}) => {
  if (donations.length === 0) {
    return (
      <EmptyState
        title="No Available Donations"
        description={emptyMessage}
        icon={Utensils}
        actionText="Post Surplus Food"
        actionHref="/donations/new"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {donations.map((donation) => (
        <DonationCard key={donation.id} donation={donation} onDelist={onDelist} />
      ))}
    </div>
  );
};
