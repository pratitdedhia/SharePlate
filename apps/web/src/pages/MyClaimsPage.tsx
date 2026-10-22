import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { claimsService } from '../services/claims';
import { Claim } from '../types';
import { ClaimCard } from '../components/claims/ClaimCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Utensils } from 'lucide-react';

export const MyClaimsPage: React.FC = () => {
  const { user, isDonor } = useAuth();
  const { success, error } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await claimsService.getMyClaims(user.id, isDonor);
      setClaims(data);
    } catch (err: any) {
      error('Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user?.id, isDonor]);

  const handleCancelClaim = async (claimId: string) => {
    try {
      await claimsService.cancelClaim(claimId);
      success('Claim cancelled. Reserved portions released.');
      fetchClaims();
    } catch (err: any) {
      error(err.message || 'Failed to cancel reservation');
    }
  };

  const handleCollect = async (claimId: string) => {
    try {
      await claimsService.markCollected(claimId);
      success('Collection marked! Food is now in transit.');
      fetchClaims();
    } catch (err: any) {
      error(err.message || 'Failed to update collection status');
    }
  };

  const handleDeliver = async (claimId: string) => {
    try {
      await claimsService.markDelivered(claimId);
      success('Delivery confirmed! Rescue completed and recorded.');
      fetchClaims();
    } catch (err: any) {
      error(err.message || 'Failed to confirm delivery');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          {isDonor ? 'Community Reservations on Your Food' : 'My Reserved Food Claims'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          {isDonor
            ? 'Monitor which NGOs have reserved your surplus batches and track collection progress.'
            : 'Access pickup instructions, manage collection status, and confirm meal delivery to beneficiaries.'}
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : claims.length === 0 ? (
        <EmptyState
          title="No Active Food Claims"
          description={
            isDonor
              ? 'No community organizations have claimed your food listings yet.'
              : 'You have not reserved any food batches yet. Browse available donations and claim portions for your shelter or kitchen.'
          }
          icon={Utensils}
          actionText={isDonor ? 'Check Listings' : 'Browse Available Food'}
          actionHref={isDonor ? '/my-donations' : '/donations'}
        />
      ) : (
        <div className="space-y-5">
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onCancel={handleCancelClaim}
              onCollect={handleCollect}
              onDeliver={handleDeliver}
            />
          ))}
        </div>
      )}
    </div>
  );
};
