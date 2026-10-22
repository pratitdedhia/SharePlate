import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { DonationCategory } from '../../types';

interface DonationFiltersProps {
  search: string;
  category: string;
  city: string;
  status: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export const DonationFilters: React.FC<DonationFiltersProps> = ({
  search,
  category,
  city,
  status,
  onSearchChange,
  onCategoryChange,
  onCityChange,
  onStatusChange,
  onReset,
}) => {
  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Categories' },
    { id: 'cooked_meals', label: '🍲 Cooked Meals' },
    { id: 'bakery', label: '🥖 Bakery & Bread' },
    { id: 'produce', label: '🍎 Fresh Produce' },
    { id: 'packaged', label: '📦 Packaged Food' },
    { id: 'dairy', label: '🥛 Dairy' },
  ];

  const cities = ['all', 'Delhi NCR', 'Mumbai', 'Pune', 'Noida'];
  const hasActiveFilters = search || category !== 'all' || city !== 'all' || status !== 'available';

  return (
    <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs mb-8 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by food title, ingredients, canteen, or area..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50/50 text-sm focus:bg-white focus:border-forest-900 focus:outline-hidden transition"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onCategoryChange(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              category === c.id
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-warm-100 text-stone-700 hover:bg-warm-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* City & Status Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-warm-100 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-500">City:</span>
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-warm-50 border border-warm-200 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-hidden"
            >
              <option value="all">All Cities</option>
              {cities.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-500">Availability:</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-warm-50 border border-warm-200 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-hidden"
            >
              <option value="available">Available Now</option>
              <option value="reserved">Reserved</option>
              <option value="delivered">Completed Rescues</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
