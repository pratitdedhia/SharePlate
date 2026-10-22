import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ImpactStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'forest' | 'emerald' | 'amber' | 'blue';
}

export const ImpactStatCard: React.FC<ImpactStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'forest',
}) => {
  const colorMap = {
    forest: 'bg-emerald-50 text-forest-900 border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-0.5">
          {title}
        </span>
        <div className="text-2xl font-black text-stone-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
