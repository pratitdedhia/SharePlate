import React, { useState } from 'react';
import { Claim } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ClaimTimeline } from './ClaimTimeline';
import { CloudinaryImage } from '../common/CloudinaryImage';
import { formatDate } from '../../lib/utils';
import {
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Key,
  Lock,
  Building2,
  Store,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { claimsService } from '../../services/claims';

interface ClaimCardProps {
  claim: Claim;
  onCancel: (claimId: string) => Promise<void>;
  onCollect: (claimId: string) => Promise<void>;
  onDeliver: (claimId: string) => Promise<void>;
  onRefresh?: () => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  onCancel,
  onCollect,
  onDeliver,
  onRefresh,
}) => {
  const { user, isDonor, isRecipient, isVolunteer, isAdmin } = useAuth();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [portionsReceived, setPortionsReceived] = useState<number>(claim.quantity_claimed);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [pickupOtp, setPickupOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Restaurant Complaint & Admin Flag State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState(
    'Food Quality & Freshness (Spoilage, bad odor, unsafe temp)'
  );
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintError, setComplaintError] = useState('');

  const donation = claim.donation;
  const restaurantName =
    donation?.donor?.organization_name ||
    donation?.donor?.full_name ||
    (donation as any)?.donor_name ||
    'Donor Restaurant / Kitchen';

  const handleAction = async (actionFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await actionFn();
      if (onRefresh) onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setLoading(true);
    try {
      await claimsService.disputeClaim(claim.id, user?.id || 'user', disputeReason);
      setDisputeModalOpen(false);
      setDisputeReason('');
      if (onRefresh) onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDonorConfirmHandover = async () => {
    setLoading(true);
    try {
      await claimsService.confirmPickup(claim.id, user?.id || 'donor', pickupOtp);
      if (onRefresh) onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientConfirmReceipt = async () => {
    setLoading(true);
    try {
      await claimsService.confirmDelivery(
        claim.id,
        user?.id || 'recipient',
        portionsReceived || claim.quantity_claimed,
        deliveryOtp
      );
      if (onRefresh) onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintDescription.trim()) {
      setComplaintError('Please provide details about the issue faced.');
      return;
    }
    setComplaintSubmitting(true);
    setComplaintError('');
    try {
      await claimsService.fileRestaurantComplaint(
        claim.id,
        {
          id: user?.id || 'recipient',
          full_name: user?.full_name || 'Verified Community Partner',
          role: user?.role || 'recipient',
          phone: user?.phone || '',
        },
        {
          reason: complaintCategory,
          description: complaintDescription.trim(),
          category: complaintCategory,
        }
      );
      setComplaintModalOpen(false);
      setComplaintDescription('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setComplaintError(err.message || 'Failed to submit complaint');
    } finally {
      setComplaintSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs p-5 space-y-4">
      {/* Header with Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
        <div className="flex items-center gap-3">
          <CloudinaryImage
            publicId={donation?.cloudinary_public_id}
            src={donation?.image_url || undefined}
            fallbackSrc={donation?.fallback_unsplash_url || undefined}
            alt={donation?.title || 'Food'}
            transformOptions={{ width: 160, height: 160, crop: 'fill', gravity: 'auto' }}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            containerClassName="w-14 h-14 rounded-xl overflow-hidden shrink-0"
          />
          <div>
            <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
              {donation?.title || 'Food Donation'}
            </h4>
            <p className="text-xs text-stone-500">
              Reserved:{' '}
              <span className="font-semibold text-forest-900">
                {claim.quantity_claimed} {donation?.quantity_unit || 'portions'}
              </span>{' '}
              · {formatDate(claim.claimed_at)}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {(claim.is_flagged_to_admin || claim.complaint) && (
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Flagged to Admin</span>
            </span>
          )}
          {claim.is_disputed ? (
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Disputed
            </span>
          ) : (
            <StatusBadge status={claim.status} />
          )}
        </div>
      </div>

      {/* RESTAURANT COMPLAINT / ADMIN FLAGGED BANNER */}
      {(claim.is_flagged_to_admin || claim.complaint) && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="text-xs font-black">
                Platform Admin Alert: Complaint Flagged Against {claim.complaint?.restaurant_name || restaurantName}
              </span>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 border border-rose-300">
              Status: {claim.complaint?.status || 'open'}
            </span>
          </div>

          <div className="text-xs text-rose-900">
            <span className="font-bold">Reported Category:</span> {claim.complaint?.reason || 'Restaurant complaint under review'}
          </div>

          {claim.complaint?.description && (
            <div className="text-xs text-stone-700 bg-white/95 p-2.5 rounded-xl border border-rose-100">
              <span className="font-semibold text-stone-500 text-[11px] block mb-0.5">Complainant Remarks:</span>
              <p className="italic">"{claim.complaint.description}"</p>
            </div>
          )}

          {claim.complaint?.admin_notes && (
            <div className="text-xs text-stone-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-900 block mb-0.5">Admin Moderation Action & Resolution Notes:</span>
              <p>{claim.complaint.admin_notes}</p>
            </div>
          )}

          <div className="text-[11px] text-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span>🛡️ Flagged directly to the Platform Safety & Moderation Queue for administrative investigation.</span>
            <button
              type="button"
              onClick={() => setComplaintModalOpen(true)}
              className="font-bold text-rose-900 hover:text-rose-950 underline cursor-pointer shrink-0"
            >
              View / Add Complaint Details
            </button>
          </div>
        </div>
      )}

      {/* Dispute Alert Banner */}
      {claim.is_disputed && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Task Disputed: 0 Points Awarded</span>
          </div>
          <p className="text-rose-800 text-[11px] leading-relaxed">
            "{claim.dispute_reason || 'Food damaged or temperature compromised during transit.'}"
          </p>
          <div className="text-[10px] text-rose-700">
            Recorded by: {claim.disputed_by || 'Recipient Coordinator'} · Awaiting administrative review.
          </div>
        </div>
      )}

      {/* Lifecycle Progress Stepper */}
      <ClaimTimeline
        status={claim.status}
        claimedAt={claim.claimed_at}
        collectedAt={claim.collected_at}
        deliveredAt={claim.delivered_at}
      />

      {/* Two-Party Verification Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Pickup Verification Strip */}
        <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Donor Pickup:</span>
            </span>
            {claim.pickup_confirmed_at ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Confirmed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Pending
              </span>
            )}
          </div>

          {claim.pickup_confirmed_at ? (
            <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified by {claim.pickup_confirmed_by || 'Donor Kitchen'}</span>
            </div>
          ) : isDonor || isAdmin ? (
            <div className="space-y-0.5">
              <div className="text-[11px] text-stone-700 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-emerald-600" />
                <span>Pickup Code: <strong className="font-mono text-stone-900 bg-warm-100 px-1.5 py-0.5 rounded border border-warm-300">{claim.pickup_code || '4821'}</strong></span>
              </div>
              <p className="text-[10px] text-stone-500">
                Share with volunteer during kitchen loading dock handover.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-[11px] text-stone-600 flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Protected PIN (Held by Donor Kitchen)</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Donor kitchen verifies volunteer upon arrival to release food.
              </p>
            </div>
          )}
        </div>

        {/* Delivery Verification Strip */}
        <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>NGO Delivery:</span>
            </span>
            {claim.delivery_confirmed_at ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Verified
              </span>
            ) : claim.is_disputed ? (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                Disputed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-md">
                Pending
              </span>
            )}
          </div>

          {claim.delivery_confirmed_at ? (
            <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Verified by {claim.delivery_confirmed_by || 'Recipient NGO'} ({claim.portions_delivered_confirmed || claim.quantity_claimed} portions)
              </span>
            </div>
          ) : isRecipient || isAdmin ? (
            <div className="space-y-0.5">
              <div className="text-[11px] text-stone-700 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-blue-600" />
                <span>Delivery Code: <strong className="font-mono text-stone-900 bg-warm-100 px-1.5 py-0.5 rounded border border-warm-300">{claim.delivery_code || '7392'}</strong></span>
              </div>
              <p className="text-[10px] text-blue-700 font-medium">
                Your authorization code. Verify meals and confirm receipt upon drop-off.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-[11px] text-stone-600 flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Protected PIN (Held by Recipient Shelter)</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Recipient NGO verifies portions and confirms arrival at destination.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pickup Details Revealed (Authorized) */}
      <div className="bg-warm-50 p-3.5 rounded-xl border border-warm-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">Pickup Area:</span>
          <span>{donation?.location_label || donation?.city}</span>
        </div>

        {donation?.pickup_instructions && (
          <div className="text-stone-600 pl-6 text-[11px] leading-relaxed">
            <span className="font-semibold text-stone-700">Instructions:</span>{' '}
            {donation.pickup_instructions}
          </div>
        )}

        {donation?.donor?.phone && (
          <div className="flex items-center gap-2 text-stone-700 pl-6">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="font-medium">Donor Contact: {donation.donor.phone}</span>
          </div>
        )}
      </div>

      {/* Action Buttons with Two-Party Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          {claim.status === 'claimed' && (isAdmin || (isRecipient && claim.recipient_id === user?.id)) && (
            <button
              type="button"
              onClick={() => setConfirmCancelOpen(true)}
              disabled={loading}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Claim
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* DONOR SPECIFIC ACTION: Confirm Handover */}
          {isDonor && claim.status === 'claimed' && !claim.pickup_confirmed_at && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                maxLength={4}
                placeholder="4-digit OTP"
                value={pickupOtp}
                onChange={(e) => setPickupOtp(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-2 py-1 rounded-lg border border-emerald-300 text-xs font-mono font-bold text-center bg-emerald-50/50"
                title="Enter 4-digit code shown on volunteer's screen"
              />
              <button
                type="button"
                onClick={handleDonorConfirmHandover}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Verify & Release Food</span>
              </button>
            </div>
          )}

          {/* VOLUNTEER SPECIFIC ACTION: Mark Picked Up */}
          {isVolunteer && claim.status === 'claimed' && (
            <button
              type="button"
              onClick={() => handleAction(() => onCollect(claim.id))}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{claim.pickup_confirmed_at ? 'Start Transit' : 'Record Pickup Arrival'}</span>
            </button>
          )}

          {/* RECIPIENT SPECIFIC ACTION: Confirm Delivery & Portions */}
          {isRecipient && claim.status === 'collected' && !claim.delivery_confirmed_at && !claim.is_disputed && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-stone-500">Portions:</span>
                <input
                  type="number"
                  min={1}
                  max={claim.quantity_claimed}
                  value={portionsReceived}
                  onChange={(e) => setPortionsReceived(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-center bg-white"
                  title="Portions received"
                />
              </div>
              <input
                type="text"
                maxLength={4}
                placeholder="4-digit OTP"
                value={deliveryOtp}
                onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-2 py-1 rounded-lg border border-emerald-300 text-xs font-mono font-bold text-center bg-emerald-50/50"
                title="Enter 4-digit code shown on volunteer's screen"
              />
              <button
                type="button"
                onClick={handleRecipientConfirmReceipt}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify Receipt & Release Rewards</span>
              </button>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(true)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                Report Issue
              </button>
            </div>
          )}

          {/* VOLUNTEER SPECIFIC ACTION: Mark Delivery */}
          {isVolunteer && claim.status === 'collected' && !claim.delivery_confirmed_at && (
            <button
              type="button"
              onClick={() => handleAction(() => onDeliver(claim.id))}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Record Delivery Arrival</span>
            </button>
          )}

          {claim.status === 'delivered' && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Rescue Completed & Verified
            </span>
          )}

          {/* Always accessible Restaurant Complaint button for non-donors */}
          {!isDonor && (
            <button
              type="button"
              onClick={() => setComplaintModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                claim.is_flagged_to_admin || claim.complaint
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                  : 'text-rose-700 hover:bg-rose-50 border border-rose-200 bg-white'
              }`}
              title="Report any issues faced or file a complaint against this restaurant (flagged directly to admin)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {claim.is_flagged_to_admin || claim.complaint
                  ? 'Flagged to Admin'
                  : 'Report Restaurant Issue'}
              </span>
            </button>
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

      {/* DISPUTE MODAL */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-black text-stone-900">Flag Delivery Dispute</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              If the food arrived damaged, spoiled, below safe temperature, or missing portions, submit a dispute. The task will be marked disputed and points held at 0.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Dispute Details:</label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe condition of food upon delivery..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDisputeModalOpen(false);
                  setDisputeReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition cursor-pointer disabled:opacity-50"
              >
                Submit Dispute (0 Points)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTAURANT COMPLAINT & ADMIN FLAGGING MODAL */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Report Issue / Complaint Against Restaurant
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Directly flags this claim and restaurant to the Platform Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComplaintModalOpen(false);
                  setComplaintError('');
                }}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Details */}
            <div className="bg-warm-50 rounded-2xl p-3.5 border border-warm-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Building2 className="w-4 h-4 text-forest-800 shrink-0" />
                <span>Restaurant / Kitchen: {restaurantName}</span>
              </div>
              <div className="text-stone-600 text-[11px] pl-6">
                <span className="font-semibold text-stone-700">Food Item:</span> {donation?.title || 'Rescued Surplus Batch'} ({claim.quantity_claimed} portions)
              </div>
              <div className="text-stone-600 text-[11px] pl-6">
                <span className="font-semibold text-stone-700">Location:</span> {donation?.location_label || donation?.city}
              </div>
            </div>

            {/* Existing complaint warning if already flagged */}
            {(claim.is_flagged_to_admin || claim.complaint) && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Complaint Already Under Admin Review</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Current Status: <strong className="uppercase">{claim.complaint?.status || 'Open'}</strong>. You can submit updated details below to assist the platform moderation team.
                </p>
              </div>
            )}

            {/* Issue Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">
                Select Complaint Category:
              </label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 bg-white focus:border-rose-600 focus:outline-hidden"
              >
                <option value="Food Quality & Freshness (Spoilage, bad odor, unsafe temp)">
                  🍲 Food Quality & Freshness (Spoiled, foul smell, cold/unsafe temperature)
                </option>
                <option value="Portion Discrepancy (Received fewer portions than claimed)">
                  📦 Portion Discrepancy (Received significantly less than listed)
                </option>
                <option value="Handover Refusal / Kitchen Closed during pickup window">
                  🚫 Handover Refused / Restaurant Closed during pickup deadline
                </option>
                <option value="Allergen & Ingredient Mislabeling">
                  🏷️ Allergen / Dietary Mislabeling (Undeclared allergens, wrong ingredients)
                </option>
                <option value="Hygiene & Sanitation Hazard (Unclean packaging, contamination)">
                  🧹 Hygiene & Sanitation Hazard (Unclean containers, pest/dirt contamination)
                </option>
                <option value="Staff Misconduct & Uncooperative Behavior">
                  ⚠️ Staff Misconduct (Hostile attitude, excessive pickup delay)
                </option>
                <option value="Other Operational Grievance">
                  ❓ Other Platform Compliance / Safety Issue
                </option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">
                Detailed Grievance / Issues Faced:
              </label>
              <textarea
                rows={4}
                value={complaintDescription}
                onChange={(e) => {
                  setComplaintDescription(e.target.value);
                  if (complaintError) setComplaintError('');
                }}
                placeholder="Explain in detail what happened at the restaurant (e.g. food odor, refused handover, hygiene conditions, timestamps, staff conduct)..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-rose-600 focus:outline-hidden"
              />
              {complaintError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {complaintError}
                </p>
              )}
            </div>

            {/* Admin Escalation Notice */}
            <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Escalation:</strong> Submitting this form flags this claim in the platform Admin Safety Moderation Queue. The platform admin will review restaurant logs, investigate, and can issue an official warning or deactivate the restaurant account if necessary.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-warm-100">
              <button
                type="button"
                onClick={() => {
                  setComplaintModalOpen(false);
                  setComplaintError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleComplaintSubmit}
                disabled={complaintSubmitting || !complaintDescription.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{complaintSubmitting ? 'Flagging to Admin...' : 'Submit Complaint & Flag to Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
