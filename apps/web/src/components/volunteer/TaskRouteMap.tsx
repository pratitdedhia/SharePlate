import React, { useState } from 'react';
import { TripStop } from '../../types';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Building2,
  UtensilsCrossed,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface TaskRouteMapProps {
  stops: TripStop[];
  corridorLabel?: string;
  onSelectStop?: (stopId: string) => void;
  selectedStopId?: string;
}

export const TaskRouteMap: React.FC<TaskRouteMapProps> = ({
  stops,
  corridorLabel = 'Delhi North-West Corridor',
  onSelectStop,
  selectedStopId,
}) => {
  const [activeLegIndex, setActiveLegIndex] = useState(0);

  // Filter SharePlate rescue task stops in sequence (pickups & deliveries)
  const taskStops = stops.filter((s) => s.type === 'pickup' || s.type === 'delivery');
  const personalOrigin = stops.find((s) => s.type === 'start');
  const personalDestination = stops.find((s) => s.type === 'destination');

  // Build external Google Maps direction URL
  const generateGoogleMapsUrl = (originAddr: string, destAddr: string, waypoints: string[] = []) => {
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddr)}&destination=${encodeURIComponent(destAddr)}`;
    if (waypoints.length > 0) {
      url += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
    }
    return url;
  };

  // Primary task route link between first pickup and last delivery
  const firstPickup = taskStops.find((s) => s.type === 'pickup');
  const lastDelivery = [...taskStops].reverse().find((s) => s.type === 'delivery');

  const mainTaskMapsUrl =
    firstPickup && lastDelivery
      ? generateGoogleMapsUrl(
          firstPickup.address,
          lastDelivery.address,
          taskStops.slice(1, -1).map((s) => s.address)
        )
      : personalOrigin && personalDestination
      ? generateGoogleMapsUrl(personalOrigin.address, personalDestination.address)
      : '#';

  return (
    <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden shadow-xs space-y-6">
      {/* Route Header */}
      <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-warm-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-forest-900 text-white">
              Food Rescue Corridor Route
            </span>
            <span className="text-xs text-stone-500 font-bold flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              {corridorLabel}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-1">
            Map-Based Rescue Route & Stop Order
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Sequential route showing donor pickups and recipient shelter deliveries in verified transit order.
          </p>
        </div>

        {/* External Live Navigation Button */}
        {firstPickup && lastDelivery && (
          <a
            href={mainTaskMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition shadow-xs shrink-0"
          >
            <Navigation className="w-4 h-4 text-emerald-300" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
          </a>
        )}
      </div>

      <div className="px-6 space-y-6">
        {/* Honest Navigation Disclosure Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <span>Navigation & Route Disclosure:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              The schematic below presents the verified stop order for your assigned SharePlate tasks. Live GPS
              turn-by-turn guidance and real-time traffic are powered via the <strong>Google Maps</strong> link.
              Personal commute endpoints are kept strictly separate from donor and shelter handovers.
            </p>
          </div>
        </div>

        {/* Visual Map Schematic of Stops in Order */}
        <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Ordered Stop Sequence</span>
            <span className="text-[11px] text-stone-500 font-semibold">
              {taskStops.length} SharePlate Task Stops · {taskStops.filter((s) => s.completed).length} Completed
            </span>
          </div>

          {/* Interactive Stop Stepper / Map Track */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Optional Personal Commute Departure */}
            {personalOrigin && (
              <div
                className={`p-3.5 rounded-xl border transition ${
                  personalOrigin.completed
                    ? 'bg-stone-50 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-stone-500 mb-1">
                  <span>Personal Origin</span>
                  <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">Commute</span>
                </div>
                <div className="font-bold text-xs text-stone-900 line-clamp-1">{personalOrigin.name}</div>
                <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{personalOrigin.address}</div>
                <div className="mt-2 text-[10px] font-semibold text-stone-400 italic">
                  Personal travel start · No food action
                </div>
              </div>
            )}

            {/* 2. Task Stops in Order */}
            {taskStops.map((stop, idx) => {
              const isSelected = selectedStopId === stop.id;
              const isPickup = stop.type === 'pickup';
              const legMapsUrl = generateGoogleMapsUrl(
                idx === 0 && personalOrigin ? personalOrigin.address : taskStops[idx - 1]?.address || stop.address,
                stop.address
              );

              return (
                <div
                  key={stop.id}
                  onClick={() => onSelectStop && onSelectStop(stop.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                    stop.completed
                      ? 'bg-emerald-50/60 border-emerald-300 text-stone-600'
                      : isSelected
                      ? 'bg-white border-forest-900 ring-2 ring-emerald-500/30 shadow-md'
                      : isPickup
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs'
                      : 'bg-blue-50/40 border-blue-200 hover:border-blue-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                    <span className={isPickup ? 'text-amber-800' : 'text-blue-800'}>
                      Stop {stop.sequence}: {isPickup ? 'Donor Pickup' : 'Shelter Drop-off'}
                    </span>
                    {stop.completed ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded font-extrabold ${
                          isPickup ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {stop.portions} portions
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-stone-900 line-clamp-1">{stop.name}</div>
                  <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{stop.address}</div>

                  {stop.food_title && (
                    <div className="mt-1.5 text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3 text-stone-400" />
                      <span className="line-clamp-1">{stop.food_title}</span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-warm-200/60 flex items-center justify-between text-[11px]">
                    <a
                      href={legMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-forest-900 hover:text-forest-950 font-bold inline-flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <span className="text-[10px] text-stone-400 font-medium">
                      {isPickup ? 'Dock Handover' : 'NGO Receipt'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 3. Optional Personal Commute Arrival */}
            {personalDestination && (
              <div
                className={`p-3.5 rounded-xl border transition ${
                  personalDestination.completed
                    ? 'bg-stone-50 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-stone-500 mb-1">
                  <span>Personal Destination</span>
                  <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">Commute</span>
                </div>
                <div className="font-bold text-xs text-stone-900 line-clamp-1">{personalDestination.name}</div>
                <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{personalDestination.address}</div>
                <div className="mt-2 text-[10px] font-semibold text-stone-400 italic">
                  Personal travel end · No food action
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Directions Between Task Stops */}
        {taskStops.length >= 2 && (
          <div className="border border-warm-200 rounded-2xl p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-warm-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-forest-900" />
                <span>Turn-by-Turn Transit Corridor Directions</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">Corridor Transit Segment</span>
            </div>

            <div className="space-y-3">
              {taskStops.map((stop, idx) => {
                if (idx === taskStops.length - 1) return null;
                const nextStop = taskStops[idx + 1];
                const segmentMapsUrl = generateGoogleMapsUrl(stop.address, nextStop.address);

                return (
                  <div
                    key={`seg-${stop.id}-${nextStop.id}`}
                    className="p-3.5 rounded-xl bg-warm-50/70 border border-warm-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{stop.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                        <span>{nextStop.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        From <em>{stop.address}</em> proceed along {corridorLabel} toward <em>{nextStop.address}</em>.
                      </p>
                    </div>

                    <a
                      href={segmentMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-forest-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition shrink-0 self-start sm:self-center"
                    >
                      <Navigation className="w-3 h-3 text-emerald-700" />
                      <span>Navigate Leg</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

