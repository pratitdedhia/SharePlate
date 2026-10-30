import React from 'react';
import { Database, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoModeBanner: React.FC<{ className?: string }> = ({ className = 'mb-6' }) => {
  return (
    <div
      className={`p-3.5 rounded-2xl bg-white border border-warm-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-stone-600 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-forest-900 flex items-center justify-center shrink-0">
          <Database className="w-3.5 h-3.5" />
        </div>
        <p className="leading-relaxed">
          <strong className="text-stone-900 font-bold">Demo mode (Client-Only):</strong> Actions update state in your local browser session. Data is not shared across devices or other users.
          The production architecture (Express API + Supabase PostgreSQL with atomic RPC claims and RLS) is included in the repository.
        </p>
      </div>
      <Link
        to="/about"
        className="text-[11px] font-bold text-forest-900 hover:text-emerald-700 bg-warm-100 hover:bg-warm-200 px-3 py-1 rounded-lg transition shrink-0 self-end sm:self-auto"
      >
        Architecture Details →
      </Link>
    </div>
  );
};
