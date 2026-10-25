import React, { useEffect, useState } from 'react';
import { impactService } from '../services/impact';
import { ImpactMetrics, ActivityLog } from '../types';
import { ImpactStatCard } from '../components/impact/ImpactStatCard';
import { ImpactCharts } from '../components/impact/ImpactCharts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatDate } from '../lib/utils';
import {
  UtensilsCrossed,
  PackageCheck,
  Building,
  TrendingUp,
  Leaf,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const [metricsData, activityData] = await Promise.all([
          impactService.getImpactSummary(),
          impactService.getActivityFeed(),
        ]);
        setMetrics(metricsData);
        setActivity(activityData);
      } catch (err) {
        console.error('Failed to load impact metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-forest-900 border border-emerald-200 mb-2">
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          Demo Impact Snapshot
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900">
          Measurable Community & Ecological Impact
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1 leading-relaxed">
          Calculated from the current donation and claim records. Rescue rate is delivered portions divided by listed portions.
          We distinguish between listed, reserved, delivered, and available food.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ImpactStatCard
          title="Portions Delivered"
          value={metrics.portionsDelivered}
          subtitle="Delivered to community beneficiaries"
          icon={PackageCheck}
          color="emerald"
        />
        <ImpactStatCard
          title="Portions Listed"
          value={metrics.portionsListed}
          subtitle="Total surplus food posted"
          icon={UtensilsCrossed}
          color="forest"
        />
        <ImpactStatCard
          title="Active Participants"
          value={metrics.activeDonors + metrics.participatingRecipients}
          subtitle={`${metrics.activeDonors} Donors · ${metrics.participatingRecipients} Partner NGOs`}
          icon={Building}
          color="blue"
        />
        <ImpactStatCard
          title="Portion Rescue Rate"
          value={`${metrics.completionRatePercent}%`}
          subtitle="Delivered portions ÷ listed portions"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Charts & Ecological Calculations */}
      <ImpactCharts metrics={metrics} />

      {/* Real-time Activity Feed */}
      <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-stone-900">Recent Food Rescue Stream</h3>
        </div>

        <div className="divide-y divide-warm-100">
          {activity.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-bold text-stone-900 capitalize">
                    {item.action.replace('_', ' ')}
                  </span>
                  <span className="text-stone-500 ml-2">
                    {item.details.title || (item.details.quantity && `${item.details.quantity} portions`) || 'Demo community activity'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-stone-400">{formatDate(item.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
