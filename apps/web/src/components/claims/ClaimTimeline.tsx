import React from 'react';
import { CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import { ClaimStatus } from '../../types';

interface ClaimTimelineProps {
  status: ClaimStatus;
  claimedAt?: string | null;
  collectedAt?: string | null;
  deliveredAt?: string | null;
}

export const ClaimTimeline: React.FC<ClaimTimelineProps> = ({
  status,
}) => {
  const isClaimed = true;
  const isCollected = status === 'collected' || status === 'delivered';
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 font-medium">
        This reservation was cancelled and food portions were returned to the available pool.
      </div>
    );
  }

  const steps = [
    {
      label: 'Reserved',
      desc: 'Claim created',
      active: isClaimed,
      done: isCollected || isDelivered,
      icon: Clock,
    },
    {
      label: 'Collected',
      desc: 'Picked up from donor',
      active: isCollected,
      done: isDelivered,
      icon: Truck,
    },
    {
      label: 'Delivered',
      desc: 'Distributed to community',
      active: isDelivered,
      done: isDelivered,
      icon: Home,
    },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-warm-200 z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-emerald-600 transition-all duration-300 z-0"
          style={{
            width: isDelivered ? '88%' : isCollected ? '44%' : '0%',
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : step.active
                    ? 'bg-forest-900 text-white ring-4 ring-emerald-100'
                    : 'bg-white border-2 border-warm-300 text-stone-400'
                }`}
              >
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step.active ? 'text-forest-950' : 'text-stone-400'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-stone-400 hidden sm:block">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
