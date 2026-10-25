import React from 'react';
import { ImpactMetrics } from '../../types';
import { Leaf, Info, CheckCircle2, TrendingUp } from 'lucide-react';

interface ImpactChartsProps {
  metrics: ImpactMetrics;
}

export const ImpactCharts: React.FC<ImpactChartsProps> = ({ metrics }) => {
  const { portionsAvailable, deliveredPercent: deliveredPct, reservedPercent: reservedPct, availablePercent: availablePct } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
      {/* Portions Distribution Chart */}
      <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Portion Distribution & Rescue Funnel
          </h3>
          <span className="text-xs font-semibold text-stone-500">
            Total {metrics.portionsListed} Listed
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 bg-warm-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-600 transition-all duration-500"
            style={{ width: `${deliveredPct}%` }}
            title={`Delivered: ${metrics.portionsDelivered} portions (${deliveredPct}%)`}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${reservedPct}%` }}
            title={`Reserved/In-Transit: ${metrics.portionsReserved} portions (${reservedPct}%)`}
          />
          <div
            className="bg-stone-300 transition-all duration-500"
            style={{ width: `${availablePct}%` }}
            title={`Available: ${portionsAvailable} portions (${availablePct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Delivered
            </div>
            <div className="text-lg font-black text-emerald-950">{metrics.portionsDelivered}</div>
            <span className="text-[10px] text-stone-500">{deliveredPct}% of total</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Reserved
            </div>
            <div className="text-lg font-black text-amber-950">{metrics.portionsReserved}</div>
            <span className="text-[10px] text-stone-500">{reservedPct}% in transit</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block" />
              Available
            </div>
            <div className="text-lg font-black text-stone-900">{portionsAvailable}</div>
            <span className="text-[10px] text-stone-500">{availablePct}% open</span>
          </div>
        </div>
      </div>

      {/* Environmental & Defensible Carbon Savings Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-forest-950 text-white p-6 rounded-3xl shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            Defensible Carbon & Waste Offset
          </div>
          <h3 className="text-xl font-black tracking-tight text-white mb-2">
            Measurable Environmental Savings
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            When food rots in landfills, it emits methane—a greenhouse gas 28× more potent than carbon dioxide.
            The demo estimate counts portions marked delivered in the local data.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-emerald-800/60">
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">Food Rescued</span>
            <div className="text-2xl font-black text-white">~{metrics.estimatedFoodRescuedKg} kg</div>
            <span className="text-[10px] text-emerald-200/60">Delivered portions</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">CO₂e Avoided</span>
            <div className="text-2xl font-black text-emerald-300">~{metrics.estimatedCo2eSavedKg} kg</div>
            <span className="text-[10px] text-emerald-200/60">Avoided landfill emissions</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40 text-[11px] text-emerald-200/80">
          <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
          <p className="leading-tight">
            <strong className="text-white">Methodology Note:</strong> {metrics.methodologyNote}
          </p>
        </div>
      </div>
    </div>
  );
};
