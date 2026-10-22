import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-md">
        <UtensilsCrossed className="w-8 h-8 text-emerald-300" />
      </div>
      <div>
        <h1 className="text-4xl font-black text-stone-900">404</h1>
        <h2 className="text-lg font-bold text-stone-800 mt-1">Page Not Found</h2>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          The page or food listing you are looking for doesn't exist or has expired.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 transition shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};
