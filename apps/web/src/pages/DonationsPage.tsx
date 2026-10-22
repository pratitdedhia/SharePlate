import React, { useState, useEffect } from 'react';
import { donationsService, DonationFilterParams } from '../services/donations';
import { Donation } from '../types';
import { DonationFilters } from '../components/donations/DonationFilters';
import { DonationGrid } from '../components/donations/DonationGrid';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [status, setStatus] = useState<string>('available');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params: DonationFilterParams = {
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
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
  }, [search, category, city, status]);

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setCity('all');
    setStatus('available');
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

      {/* Interactive Filters & Search */}
      <DonationFilters
        search={search}
        category={category}
        city={city}
        status={status}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onCityChange={setCity}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-900">{donations.length}</strong> donation listing{donations.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Grid or Skeleton */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <DonationGrid
          donations={donations}
          emptyMessage="No surplus food listings match your current filters. Try expanding your search or clearing category filters."
        />
      )}
    </div>
  );
};
