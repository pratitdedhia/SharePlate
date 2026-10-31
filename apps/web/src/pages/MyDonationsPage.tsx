import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { donationsService } from '../services/donations';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { Donation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PlusCircle, Clock, MapPin, Eye, XCircle } from 'lucide-react';
import { CloudinaryImage } from '../components/common/CloudinaryImage';
import { formatDate } from '../lib/utils';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const MyDonationsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const myItems = await donationsService.getMyDonations(user?.id);
      // Filter for this donor's listings

      setDonations(myItems);
    } catch (err: any) {
      error('Failed to load your donation listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, [user?.id]);

  useLiveUpdates(fetchMyDonations);

  const handleCancelDonation = async (donationId: string) => {
    try {
      const res = await donationsService.cancelDonation(donationId, user?.id, user?.role);
      if (res.penaltyApplied) {
        error(`Donation cancelled. A ${res.penaltyPoints}-point reliability penalty was deducted because portions were booked by an NGO.`);
      } else {
        success('Donation listing cancelled.');
      }
      setCancelTargetId(null);
      fetchMyDonations();
      return;
      success('Donation listing cancelled.');
      setCancelTargetId(null);
      fetchMyDonations();
    } catch (err: any) {
      error(err.message || 'Failed to cancel donation');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">My Surplus Food Listings</h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track published batches, monitor community reservations, and update operational statuses.
          </p>
        </div>
        <Link
          to="/donations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          Create New Listing
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No Donations Posted Yet"
          description="You haven't published any food donation listings yet. Share your surplus batches with nearby community kitchens."
          actionText="+ Post Surplus Food"
          actionHref="/donations/new"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden shadow-xs divide-y divide-warm-100">
          {donations.map((d) => {
            return (
              <div key={d.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <CloudinaryImage
                    publicId={d.cloudinary_public_id}
                    src={d.image_url || undefined}
                    fallbackSrc={d.fallback_unsplash_url || undefined}
                    alt={d.title}
                    transformOptions={{ width: 160, height: 160, crop: 'fill', gravity: 'auto' }}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    containerClassName="w-16 h-16 rounded-2xl overflow-hidden shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-1">{d.title}</h3>
                      <StatusBadge status={d.status} size="sm" />
                    </div>
                    <p className="text-xs text-stone-500">
                      Remaining:{' '}
                      <strong className="text-forest-900">
                        {d.quantity_available} / {d.quantity_total} {d.quantity_unit}
                      </strong>
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pickup: {formatDate(d.pickup_deadline)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {d.location_label || d.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/donations/${d.id}`}
                    className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-warm-100 transition text-xs font-semibold flex items-center gap-1"
                    title="View public details"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                  {d.status === 'available' && (
                    <button
                      onClick={() => setCancelTargetId(d.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition text-xs font-semibold flex items-center gap-1"
                      title="Cancel listing"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        title="Cancel This Food Listing?"
        message={(() => { const target = donations.find((d) => d.id === cancelTargetId); return target && (target.quantity_available < target.quantity_total || target.status === 'claimed' || target.status === 'reserved') ? '⚠️ RELIABILITY PENALTY: This food batch has active shelter reservations. If you cancel after a recipient has booked portions, a 50-point reliability penalty will be applied to your kitchen rewards profile.' : 'Are you sure you want to cancel this surplus food listing? It will no longer be visible for community claims.'; })()}
        confirmText="Yes, Cancel Listing"
        isDestructive={true}
        onCancel={() => setCancelTargetId(null)}
        onConfirm={() => {
          if (cancelTargetId) handleCancelDonation(cancelTargetId);
        }}
      />
    </div>
  );
};
