import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Building, AlertCircle, ArrowRight } from 'lucide-react';
import { Donation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getCloudinaryUrl } from '../../lib/cloudinary';
import { formatTimeRemaining, getCategoryLabel } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface DonationCardProps {
  donation: Donation;
}

export const DonationCard: React.FC<DonationCardProps> = ({ donation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const timeInfo = formatTimeRemaining(donation.pickup_deadline);

  const handleCardReserve = () => {
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

  // Cloudinary transformed delivery URL: 600x400 auto crop, auto quality, auto format
  const imageUrl = getCloudinaryUrl(donation.cloudinary_public_id || donation.image_url, {
    width: 600,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });

  return (
    <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col h-full">
      {/* Food Image with Cloudinary Optimization */}
      <div className="relative h-48 w-full bg-warm-200 overflow-hidden">
        <img
          src={imageUrl}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge status={donation.status} size="sm" />
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-stone-800 backdrop-blur-xs border border-warm-200">
            {getCategoryLabel(donation.category)}
          </span>
        </div>

        {donation.quantity_available > 0 && (
          <div className="absolute bottom-3 right-3 bg-forest-950/80 text-white backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm">
            {donation.quantity_available} {donation.quantity_unit} left
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 group-hover:text-forest-900 transition line-clamp-1 mb-1.5">
            {donation.title}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {donation.description}
          </p>

          {/* Allergen Tag */}
          {donation.allergens && donation.allergens.toLowerCase() !== 'none' && (
            <div className="mb-3 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="truncate">Allergens: {donation.allergens}</span>
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
            className="w-full py-2.5 rounded-xl text-xs font-bold text-forest-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            View Details & Reserve <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
