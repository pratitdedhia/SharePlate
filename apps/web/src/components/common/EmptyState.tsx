import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white/70 rounded-3xl border border-dashed border-warm-300 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-4 border border-forest-100">
        <Icon className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-base font-bold text-forest-950 mb-1">{title}</h3>
      <p className="text-xs text-stone-600 max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      {actionText && (
        actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-forest-900 text-white hover:bg-forest-800 transition shadow-xs"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-forest-900 text-white hover:bg-forest-800 transition shadow-xs"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
