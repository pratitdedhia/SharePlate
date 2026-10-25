import React, { useState } from 'react';
import { Claim } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ClaimTimeline } from './ClaimTimeline';
import { DEFAULT_FALLBACK_IMAGE, getCloudinarySrcSet, getCloudinaryUrl, isCloudinaryAsset } from '../../lib/cloudinary';
import { formatDate } from '../../lib/utils';
import { MapPin, Phone, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ClaimCardProps {
  claim: Claim;
  onCancel: (claimId: string) => Promise<void>;
  onCollect: (claimId: string) => Promise<void>;
  onDeliver: (claimId: string) => Promise<void>;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  onCancel,
  onCollect,
  onDeliver,
}) => {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const donation = claim.donation;
  const imageSource = donation?.cloudinary_public_id || donation?.image_url;
  const imageUrl = getCloudinaryUrl(imageSource, {
    width: 800,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
  const imageSrcSet = getCloudinarySrcSet(imageSource, { height: 200, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' });

  const handleAction = async (actionFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await actionFn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs p-5 space-y-4">
      {/* Header with Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={imageUrl}
              srcSet={imageSrcSet}
              sizes="56px"
              loading="lazy"
              alt={donation?.title || 'Food'}
              className="w-14 h-14 rounded-xl object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.srcset = '';
                event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                setImageFailed(true);
              }}
            />
            {(!isCloudinaryAsset(imageUrl) || imageFailed) && <span className="absolute -bottom-1 left-0 bg-stone-950/75 text-white text-[8px] px-1 rounded">Unsplash fallback</span>}
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{donation?.title || 'Food Donation'}</h4>
            <p className="text-xs text-stone-500">
              Reserved: <span className="font-semibold text-forest-900">{claim.quantity_claimed} {donation?.quantity_unit || 'portions'}</span> · {formatDate(claim.claimed_at)}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={claim.status} />
        </div>
      </div>

      {/* Lifecycle Progress Stepper */}
      <ClaimTimeline
        status={claim.status}
        claimedAt={claim.claimed_at}
        collectedAt={claim.collected_at}
        deliveredAt={claim.delivered_at}
      />

      {/* Pickup Details Revealed (Authorized) */}
      <div className="bg-warm-50 p-3.5 rounded-xl border border-warm-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">Pickup Area:</span>
          <span>{donation?.location_label || donation?.city}</span>
        </div>

        {donation?.pickup_instructions && (
          <div className="text-stone-600 pl-6 text-[11px] leading-relaxed">
            <span className="font-semibold text-stone-700">Instructions:</span> {donation.pickup_instructions}
          </div>
        )}

        {donation?.donor?.phone && (
          <div className="flex items-center gap-2 text-stone-700 pl-6">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="font-medium">Donor Contact: {donation.donor.phone}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          {claim.status === 'claimed' && (
            <button
              onClick={() => setConfirmCancelOpen(true)}
              disabled={loading}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Claim
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {claim.status === 'claimed' && (
            <button
              onClick={() => handleAction(() => onCollect(claim.id))}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" /> Mark Picked Up
            </button>
          )}

          {claim.status === 'collected' && (
            <button
              onClick={() => handleAction(() => onDeliver(claim.id))}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery
            </button>
          )}

          {claim.status === 'delivered' && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Rescue Completed & Logged
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmCancelOpen}
        title="Cancel Food Reservation?"
        message="Are you sure you want to cancel this reservation? The reserved portions will immediately become available again for other community organizations."
        confirmText="Yes, Cancel Claim"
        isDestructive={true}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={async () => {
          setConfirmCancelOpen(false);
          await handleAction(() => onCancel(claim.id));
        }}
      />
    </div>
  );
};
