import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Building, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Donation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CloudinaryImage } from '../common/CloudinaryImage';
import { formatTimeRemaining, getCategoryLabel } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface DonationCardProps {
  donation: Donation;
}

export const DonationCard: React.FC<DonationCardProps> = ({ donation }) => {
  const navigate = useNavigate();
  const { user, isDonor, isVolunteer } = useAuth();
  const timeInfo = formatTimeRemaining(donation.pickup_deadline);
  const isExpired = donation.status === 'expired' || timeInfo.isExpired;

  const handleCardReserve = () => {
    if (isExpired) return;
    if (!user) {
      navigate('/login', {
        state: {
          from: `/donations/${donation.id}`,
          autoReserve: true,
        },
      });
      return;
    }
    navigate(`/donations/${donation.id}`);
  };

  const getCardCtaLabel = () => {
    if (isExpired) return 'Listing Expired (Past Deadline)';
    if (!user) return 'View Details & Reserve';
    if (isDonor) return 'View Batch Details';
    if (isVolunteer) return 'View Delivery Details';
    return 'View Details & Reserve';
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col h-full ${
        isExpired ? 'opacity-70 bg-stone-50/80' : ''
      }`}
    >
      {/* Food Image with Cloudinary Optimization */}
      <div
        onClick={handleCardReserve}
        className="relative h-48 w-full bg-warm-200 overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardReserve(); }}
        aria-label={`View details for ${donation.title}`}
      >
        <CloudinaryImage
          publicId={donation.cloudinary_public_id}
          src={donation.image_url || undefined}
          fallbackSrc={donation.fallback_unsplash_url || undefined}
          alt={donation.title}
          transformOptions={{
            width: 600,
            height: 400,
            crop: 'fill',
            gravity: 'auto',
            quality: 'auto',
            format: 'auto',
          }}
          showBadge={true}
          className={`w-full h-full object-cover group-hover:scale-102 transition duration-300 ${
            isExpired ? 'grayscale-40' : ''
          }`}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <StatusBadge status={isExpired ? 'expired' : donation.status} size="sm" />
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-stone-800 backdrop-blur-xs border border-warm-200">
            {getCategoryLabel(donation.category)}
          </span>
          {donation.dietary_type && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-forest-900 border border-emerald-200">
              {donation.dietary_type === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
            </span>
          )}
        </div>

        {donation.quantity_available > 0 && !isExpired && (
          <div className="absolute bottom-3 right-3 bg-forest-950/80 text-white backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
            {donation.quantity_available} {donation.quantity_unit} left
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={handleCardReserve}
            className="text-base font-bold text-stone-900 group-hover:text-forest-900 transition line-clamp-1 mb-1.5 cursor-pointer"
          >
            {donation.title}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {donation.description}
          </p>

          {/* Allergen Tag */}
          {donation.allergens && donation.allergens.toLowerCase() !== 'none' && (
            <div className="mb-2.5 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="truncate">Allergens: {donation.allergens}</span>
            </div>
          )}

          {/* Food Safety & Storage note */}
          {donation.storage_note && (
            <div className="mb-3 text-[11px] text-stone-600 bg-warm-50 px-2 py-1 rounded-lg border border-warm-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-emerald-700 shrink-0" />
              <span className="truncate font-medium">{donation.storage_note}</span>
            </div>
          )}

          {/* Meta Information */}
          <div className="space-y-1.5 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate font-medium text-stone-700">
                {donation.donor?.organization_name || donation.donor?.full_name || 'Verified Community Donor'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{donation.location_label || donation.city}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 shrink-0 ${timeInfo.isUrgent ? 'text-amber-600' : 'text-stone-400'}`} />
              <span className={`font-medium ${timeInfo.isUrgent ? 'text-amber-700 font-semibold' : 'text-stone-600'}`}>
                {timeInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCardReserve}
            disabled={isExpired}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
              isExpired
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                : 'text-forest-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
            }`}
          >
            {getCardCtaLabel()} {!isExpired && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
