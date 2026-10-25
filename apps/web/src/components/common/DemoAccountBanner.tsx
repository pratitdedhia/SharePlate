import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ShieldCheck, UserCheck } from 'lucide-react';

export const DemoAccountBanner: React.FC = () => {
  const { user, isDemoUser } = useAuth();

  if (!isDemoUser || !user) return null;

  return (
    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3 text-forest-950">
        <div className="w-8 h-8 rounded-xl bg-forest-900 text-emerald-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-forest-900 text-white px-2 py-0.5 rounded-md">
              DEMO ACCOUNT
            </span>
            <span className="font-bold text-forest-900 capitalize">
              Role: {user.role}
            </span>
          </div>
          <p className="text-stone-600 text-xs mt-0.5">
            Active Persona: <strong className="text-stone-900">{user.full_name}</strong>{' '}
            {user.organization_name && `(${user.organization_name})`} · {user.city}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Seeded HackDays Persona
        </span>
      </div>
    </div>
  );
};
