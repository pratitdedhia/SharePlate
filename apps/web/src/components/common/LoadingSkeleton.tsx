import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
          <div className="h-48 bg-warm-200" />
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-warm-200 rounded-full w-24" />
              <div className="h-4 bg-warm-200 rounded-full w-16" />
            </div>
            <div className="h-6 bg-warm-200 rounded-md w-3/4" />
            <div className="h-4 bg-warm-200 rounded-md w-full" />
            <div className="h-4 bg-warm-200 rounded-md w-2/3" />
            <div className="pt-3 border-t border-warm-100 flex justify-between items-center">
              <div className="h-4 bg-warm-200 rounded-full w-20" />
              <div className="h-8 bg-warm-200 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
