import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { adminService } from '../services/admin';
import { donationsService, DonationFilterParams } from '../services/donations';
import { Donation } from '../types';
import { DonationFilters } from '../components/donations/DonationFilters';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { DonationGrid } from '../components/donations/DonationGrid';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { MapPin, ShieldCheck, AlertTriangle, Ban, X } from 'lucide-react';
import { inferStateFromCity } from '../lib/utils';

export const DonationsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const [delistTarget, setDelistTarget] = useState<Donation | null>(null);
  const [delistReason, setDelistReason] = useState<string>('Administrative moderation / quality policy check');
  const [isDelisting, setIsDelisting] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('all');

  // Strict state isolation policy: non-admins are strictly locked to their registered state!
  const userState = user?.state || inferStateFromCity(user?.city);
  const isStateLocked = Boolean(user) && !isAdmin;

  const [state, setState] = useState<string>(() => {
    if (isStateLocked && userState) {
      return userState;
    }
    return searchParams.get('state') || 'all';
  });

  const [city, setCity] = useState<string>(() => {
    return searchParams.get('city') || 'all';
  });
  const [status, setStatus] = useState<string>('available');

  // Keep state locked to user's registered state whenever user profile is active
  useEffect(() => {
    if (isStateLocked && userState) {
      setState(userState);
    }
  }, [isStateLocked, userState]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const effectiveState = isStateLocked ? userState : (state !== 'all' ? state : undefined);
      const params: DonationFilterParams = {
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        state: effectiveState,
        city: city !== 'all' ? city : undefined,
        status: status !== 'all' ? status : undefined,
      };

      const res = await donationsService.getDonations(params);
      setDonations(res.data);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [search, category, state, city, status, isStateLocked, userState]);

  useLiveUpdates(fetchDonations);

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    if (!isStateLocked) {
      setState('all');
    } else if (userState) {
      setState(userState);
    }
    setCity('all');
    setStatus('available');
  };

  const handleConfirmDelist = async () => {
    if (!delistTarget || !user) return;
    setIsDelisting(true);
    try {
      await adminService.delistDonation(delistTarget.id, delistReason, user.id);
      success(`Food batch "${delistTarget.title}" has been delisted from the platform without penalizing the donor or volunteer.`);
      setDelistTarget(null);
      await fetchDonations();
    } catch (err: any) {
      error(err.message || 'Failed to delist food donation');
    } finally {
      setIsDelisting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Browse Surplus Food Donations
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Explore real-time surplus meals from canteens, caterers, and restaurants ready for community collection.
        </p>
      </div>

      {/* State Restriction Notice Banner */}
      {isStateLocked && userState && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-forest-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Showing surplus food listings strictly for your registered state:{' '}
              <strong className="text-forest-900 font-bold">{userState}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold border border-emerald-300/60 w-fit">
            Strict State Policy (Cross-State access is Admin-only)
          </span>
        </div>
      )}

      {isAdmin && (
        <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs text-purple-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
            <span>
              <strong>Platform Administrator Mode:</strong> Global catalog access active. You can browse and filter donations across all Indian states.
            </span>
          </div>
        </div>
      )}

      {/* Interactive Filters & Search */}
      <DonationFilters
        search={search}
        category={category}
        state={state}
        city={city}
        status={status}
        isStateLocked={isStateLocked}
        lockedStateName={userState}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStateChange={setState}
        onCityChange={setCity}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-900">{donations.length}</strong> donation listing{donations.length === 1 ? '' : 's'}
          {isStateLocked && userState ? ` in ${userState}` : ''}
        </span>
      </div>

      {/* Grid or Skeleton */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <DonationGrid
          donations={donations}
          emptyMessage={`No surplus food listings match your current filters in ${isStateLocked && userState ? userState : 'this region'}. Try expanding your search or clearing category filters.`}
          onDelist={(d) => {
            setDelistTarget(d);
            setDelistReason('Administrative moderation / quality policy check');
          }}
        />
      )}

      {delistTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Delist Food Listing (Admin)</h3>
                  <p className="text-xs text-stone-500">Moderation removal from public marketplace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDelistTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Harmless Administrative Action</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Delisting removes this food item from public browsing. Any active NGO claims will be cancelled peacefully without penalizing either the donor restaurant or the volunteer courier.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Reason for delisting:
              </label>
              <textarea
                rows={3}
                value={delistReason}
                onChange={(e) => setDelistReason(e.target.value)}
                placeholder="e.g. Duplicate batch, kitchen requested removal, food safety moderation..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-rose-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDelistTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDelisting}
                onClick={handleConfirmDelist}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>{isDelisting ? 'Delisting...' : 'Confirm Delist Food'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
