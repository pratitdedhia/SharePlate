import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationsService } from '../services/donations';
import { claimsService } from '../services/claims';
import { Donation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { getCloudinaryUrl } from '../lib/cloudinary';
import { formatDate, formatTimeRemaining, getCategoryLabel } from '../lib/utils';
import {
  Clock,
  MapPin,
  Building,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  Utensils,
  Lock,
} from 'lucide-react';

export const DonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isDonor, isRecipient, isVolunteer, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimQuantity, setClaimQuantity] = useState<number>(1);
  const [claimNotes, setClaimNotes] = useState<string>('');
  const [claiming, setClaiming] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);

  const fetchDonation = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await donationsService.getDonationById(id);
      setDonation(data);
      if (data.quantity_available > 0) {
        setClaimQuantity(Math.min(10, data.quantity_available));
      }
    } catch (err: any) {
      error(err.message || 'Donation not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donation || !user) return;

    if (claimQuantity <= 0 || claimQuantity > donation.quantity_available) {
      error(`Please select between 1 and ${donation.quantity_available} portions.`);
      return;
    }

    setClaiming(true);
    try {
      await claimsService.claimDonation(donation.id, user.id, claimQuantity, claimNotes);
      success(`Successfully reserved ${claimQuantity} ${donation.quantity_unit}!`);
      setShowClaimModal(false);
      navigate('/my-claims');
    } catch (err: any) {
      error(err.message || 'Failed to reserve donation');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-64 bg-warm-200 rounded-3xl" />
        <div className="h-8 bg-warm-200 rounded-xl w-1/2 mx-auto" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Donation Listing Not Found</h2>
        <p className="text-xs text-stone-600">The requested food donation could not be loaded or was removed.</p>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-900 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Listings
        </Link>
      </div>
    );
  }

  const timeInfo = formatTimeRemaining(donation.pickup_deadline);
  const imageUrl = getCloudinaryUrl(donation.cloudinary_public_id || donation.image_url, {
    width: 1000,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });

  const isOwnDonation = user?.id === donation.donor_id;
  const canClaim = (isRecipient || isVolunteer || isAdmin) && !isOwnDonation && donation.status === 'available' && donation.quantity_available > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Food Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cloudinary Optimized Banner */}
          <div className="relative rounded-3xl overflow-hidden aspect-16/10 bg-warm-200 border border-warm-200 shadow-xs">
            <img src={imageUrl} alt={donation.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <StatusBadge status={donation.status} />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-stone-900 backdrop-blur-xs border border-warm-200">
                {getCategoryLabel(donation.category)}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 bg-forest-950/80 text-white backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-bold">
              ⚡ Cloudinary Hosted Asset
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">{donation.title}</h1>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {donation.description}
            </p>

            {/* Ingredients & Allergens Box */}
            <div className="pt-4 border-t border-warm-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Ingredients
                </span>
                <p className="text-xs text-stone-800 font-medium leading-relaxed">
                  {donation.ingredients || 'No specific ingredient breakdown provided by donor.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Allergens
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {donation.allergens && donation.allergens.toLowerCase() !== 'none'
                    ? donation.allergens
                    : 'No common allergens declared by donor.'}
                </p>
              </div>
            </div>

            {/* Food Safety Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Safety Guidance:</strong> SharePlate does not certify food safety. The donor is responsible
                for truthful information. Recipients must inspect food freshness upon collection.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Claim & Operational Logistics */}
        <div className="space-y-6">
          {/* Reservation Card */}
          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Available Surplus
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{donation.quantity_available}</span>
                <span className="text-sm font-semibold text-stone-500">
                  / {donation.quantity_total} {donation.quantity_unit}
                </span>
              </div>
            </div>

            {/* Countdown Urgency Indicator */}
            <div
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${
                timeInfo.isUrgent
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-forest-900'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 text-emerald-700" />
              <div>
                <span className="font-bold block">Pickup Deadline:</span>
                <span>{timeInfo.text} ({formatDate(donation.pickup_deadline)})</span>
              </div>
            </div>

            {/* Action Claim Button */}
            {canClaim ? (
              <button
                onClick={() => setShowClaimModal(true)}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-md transition flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4 text-emerald-300" />
                Reserve Food Portions
              </button>
            ) : isOwnDonation ? (
              <div className="text-center p-3 rounded-2xl bg-warm-100 text-stone-700 text-xs font-medium border border-warm-200">
                You created this donation listing.
              </div>
            ) : donation.quantity_available === 0 ? (
              <div className="text-center p-3 rounded-2xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                All portions have been reserved.
              </div>
            ) : (
              <div className="text-center p-3 rounded-2xl bg-stone-100 text-stone-600 text-xs font-medium">
                Sign in as an authorized NGO or community kitchen to reserve food.
              </div>
            )}
          </div>

          {/* Donor & Location Card */}
          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-stone-900 text-sm">Donor & Location</h3>

            <div className="space-y-3 text-stone-600">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-stone-800 block">
                    {donation.donor?.organization_name || donation.donor?.full_name}
                  </span>
                  <span className="text-[11px] text-stone-400">Verified Donor Account</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{donation.location_label || donation.city}</span>
              </div>

              {donation.preparation_time && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Prepared: {formatDate(donation.preparation_time)}</span>
                </div>
              )}
            </div>

            {/* Protected Pickup Instructions */}
            <div className="pt-3 border-t border-warm-100">
              <span className="font-bold text-stone-800 block mb-1">Pickup Instructions</span>
              {donation.pickup_instructions ? (
                <p className="text-[11px] text-stone-600 leading-relaxed bg-warm-50 p-3 rounded-xl border border-warm-200">
                  {donation.pickup_instructions}
                </p>
              ) : (
                <p className="text-[11px] text-stone-400 italic flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Full pickup address and contact will be revealed once reserved.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Reservation Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-5 animate-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Reserve Portions: {donation.title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Available to claim: {donation.quantity_available} {donation.quantity_unit}
              </p>
            </div>

            <form onSubmit={handleClaim} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Portions Needed</label>
                <input
                  type="number"
                  min="1"
                  max={donation.quantity_available}
                  value={claimQuantity}
                  onChange={(e) => setClaimQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 font-bold text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Distribution Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="e.g. For evening shelter distribution at Sector 62 transit camp..."
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-xs focus:border-forest-900 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-700 bg-warm-100 hover:bg-warm-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-forest-900 hover:bg-forest-800 transition"
                >
                  {claiming ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
