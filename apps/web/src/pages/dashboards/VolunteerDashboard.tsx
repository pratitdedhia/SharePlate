import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { demoStore, DEMO_PROFILES } from '../../lib/mockData';
import {
  Donation,
  Claim,
  RescueTask,
  VolunteerTripPlan,
  VolunteerRewardsSummary,
  REWARD_RULES,
  calculateClaimPoints,
} from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  PackageCheck,
  Building2,
  ArrowRight,
  TrendingUp,
  Activity,
  Phone,
  AlertTriangle,
  Award,
  Gift,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Compass,
  Info,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { TaskRouteMap } from '../../components/volunteer/TaskRouteMap';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  // Navigation tab state: 'planner' | 'checklist' | 'rewards'
  const [activeTab, setActiveTab] = useState<'planner' | 'checklist' | 'rewards'>('planner');

  // Trip planner state
  const [originInput, setOriginInput] = useState('DTU Main Campus, Rohini Sector 17');
  const [destinationInput, setDestinationInput] = useState('Connaught Place Metro Hub, Central Delhi');
  const [selectedCorridor, setSelectedCorridor] = useState('Delhi North-West Corridor');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['task-delhi-01']);
  const [availableTasks, setAvailableTasks] = useState<RescueTask[]>([]);
  const [activeTripPlan, setActiveTripPlan] = useState<VolunteerTripPlan | null>(null);

  // Active delivery & Two-party verification state
  const [activeClaims, setActiveClaims] = useState<Claim[]>([]);
  const [rewardsSummary, setRewardsSummary] = useState<VolunteerRewardsSummary | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispute modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeClaimId, setDisputeClaimId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Partial delivery state
  const [deliveryPortions, setDeliveryPortions] = useState<Record<string, number>>({});
  const [pickupCodeInput, setPickupCodeInput] = useState<Record<string, string>>({});
  const [deliveryCodeInput, setDeliveryCodeInput] = useState<Record<string, string>>({});
  const [deliveryPortionsInput, setDeliveryPortionsInput] = useState<Record<string, number>>({});
  const [selectedRouteStopId, setSelectedRouteStopId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Load tasks for corridor
      const tasks = await claimsService.getRescueTasks(selectedCorridor);
      setAvailableTasks(tasks);

      // 2. Load active trip plan
      const plan = await claimsService.getVolunteerTripPlan(user.id);
      setActiveTripPlan(plan);

      // 3. Load active claims for this volunteer
      const allClaims = await claimsService.getAllClaims();
      const volClaims = allClaims.filter(
        (c) => c.volunteer_id === user.id || c.status === 'claimed' || c.status === 'collected'
      );
      setActiveClaims(volClaims);

      // 4. Load rewards summary
      const rewards = await claimsService.getVolunteerRewards(user.id);
      setRewardsSummary(rewards);

      // 5. Activity stream
      setActivityLogs(demoStore.getActivityLogs().slice(0, 8));
    } catch (err: any) {
      console.error('Failed to load volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id, selectedCorridor]);

  useLiveUpdates(loadDashboardData);

  // Handle corridor preset switch
  const handleCorridorSelect = (corridor: string, origin: string, destination: string) => {
    setSelectedCorridor(corridor);
    setOriginInput(origin);
    setDestinationInput(destination);
    // Auto-select tasks matching the new corridor
    const tasks = demoStore.getRescueTasks(corridor);
    if (tasks.length > 0) {
      setSelectedTaskIds([tasks[0].id]);
    } else {
      setSelectedTaskIds([]);
    }
  };

  // Toggle task checkbox
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleOriginChange = (val: string) => {
    setOriginInput(val);
    const low = val.toLowerCase();
    if (low.includes('mumbai') || low.includes('andheri') || low.includes('andheir') || low.includes('bkc') || low.includes('kurla')) {
      if (selectedCorridor !== 'Mumbai Central Transit Corridor' && selectedCorridor !== 'all') {
        setSelectedCorridor('Mumbai Central Transit Corridor');
      }
    } else if (low.includes('pune') || low.includes('shivajinagar') || low.includes('fc road')) {
      if (selectedCorridor !== 'Pune University Corridor' && selectedCorridor !== 'all') {
        setSelectedCorridor('Pune University Corridor');
      }
    }
  };

  const handleDestinationChange = (val: string) => {
    setDestinationInput(val);
    const low = val.toLowerCase();
    if (low.includes('mumbai') || low.includes('andheri') || low.includes('andheir') || low.includes('bkc') || low.includes('kurla') || low.includes('ghatkopar')) {
      if (selectedCorridor !== 'Mumbai Central Transit Corridor' && selectedCorridor !== 'all') {
        setSelectedCorridor('Mumbai Central Transit Corridor');
      }
    } else if (low.includes('pune') || low.includes('shivajinagar') || low.includes('fc road')) {
      if (selectedCorridor !== 'Pune University Corridor' && selectedCorridor !== 'all') {
        setSelectedCorridor('Pune University Corridor');
      }
    }
  };

  // Create & accept planned route
  const handleAcceptRoute = async () => {
    if (!user) return;
    if (selectedTaskIds.length === 0) {
      error('Please select at least one rescue task along your route.');
      return;
    }

    try {
      const selectedTasks = availableTasks.filter((t) => selectedTaskIds.includes(t.id));
      const stops: any[] = [];
      let seq = 1;

      // Stop 1: Origin
      stops.push({
        id: `stop-${seq}`,
        type: 'start',
        name: 'Trip Origin Departure',
        address: originInput,
        city: user.city || 'Delhi NCR',
        sequence: seq++,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      // Stops: Pickups (SharePlate Donor Handoffs)
      for (const t of selectedTasks) {
        const matchingClaim = activeClaims.find(
          (c) => c.id === t.claim_id || c.donation_id === t.donation_id
        );
        const claimId = matchingClaim?.id || t.claim_id || `claim-${t.id}`;
        stops.push({
          id: `stop-${seq}`,
          type: 'pickup',
          name: t.pickup_location,
          address: t.pickup_address,
          city: user.city || 'Delhi NCR',
          contact_person: t.donor_name,
          phone: t.donor_phone,
          instructions: t.pickup_instructions,
          task_id: t.id,
          claim_id: claimId,
          portions: t.portions,
          food_title: t.title,
          dietary_type: t.dietary_type,
          deadline: t.pickup_deadline,
          sequence: seq++,
          completed: false,
        });
      }

      // Stops: Deliveries (SharePlate Recipient NGO Handoffs)
      for (const t of selectedTasks) {
        const matchingClaim = activeClaims.find(
          (c) => c.id === t.claim_id || c.donation_id === t.donation_id
        );
        const claimId = matchingClaim?.id || t.claim_id || `claim-${t.id}`;
        stops.push({
          id: `stop-${seq}`,
          type: 'delivery',
          name: t.dropoff_location,
          address: t.dropoff_address,
          city: user.city || 'Delhi NCR',
          contact_person: t.recipient_name,
          phone: t.recipient_phone,
          task_id: t.id,
          claim_id: claimId,
          portions: t.portions,
          food_title: t.title,
          dietary_type: t.dietary_type,
          sequence: seq++,
          completed: false,
        });
      }

      // Final stop: Destination
      stops.push({
        id: `stop-${seq}`,
        type: 'destination',
        name: 'Final Trip Destination Arrival',
        address: destinationInput,
        city: user.city || 'Delhi NCR',
        sequence: seq++,
        completed: false,
      });

      const plan = await claimsService.createTripPlan({
        volunteer_id: user.id,
        origin: originInput,
        destination: destinationInput,
        corridor_label: selectedCorridor,
        task_ids: selectedTaskIds,
        stops,
        is_demo_preview: true,
        routing_provider_note:
          'Demo route preview using corridor stops. Live turn-by-turn routing requires Mapbox or Google Maps Directions API key.',
      });

      await claimsService.acceptTripPlan(plan.id);
      success('Route accepted! Stop-by-stop checklist unlocked. Safe travels!');
      setActiveTab('checklist');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to accept trip plan');
    }
  };

  // Complete a personal commute stop (Origin/Destination) - strictly segregated from food claims!
  const handleCompletePersonalStop = async (stopId: string) => {
    if (!activeTripPlan) return;
    try {
      await claimsService.completeTripStop(activeTripPlan.id, stopId);
      success('Personal travel leg acknowledged.');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to update personal travel stop');
    }
  };

  // Legacy fallback stop complete
  const handleCompleteStop = async (stopId: string) => {
    if (!activeTripPlan) return;
    try {
      await claimsService.completeTripStop(activeTripPlan.id, stopId);
      success('Stop acknowledged!');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to update stop status');
    }
  };

  // Two-party: Volunteer initiates pickup (records arrival at dock)
  const handleVolunteerInitiatePickup = async (claimId: string) => {
    if (!user) return;
    try {
      await claimsService.initiatePickup(claimId, user.id);
      info('Recorded pickup arrival. Please ask the donor kitchen to confirm the handover.');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to record pickup arrival');
    }
  };

  // Two-party: Volunteer initiates delivery (records arrival at NGO)
  const handleVolunteerInitiateDelivery = async (claimId: string) => {
    if (!user) return;
    try {
      await claimsService.initiateDelivery(claimId, user.id);
      info('Recorded delivery arrival. Please ask the recipient NGO coordinator to confirm portions received.');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to record delivery arrival');
    }
  };

  // Dispute: Mark task as disputed (0 points)
  const handleDisputeTask = async () => {
    if (!disputeClaimId || !disputeReason.trim()) {
      error('Please provide a reason for the dispute (e.g. food spoiled, damaged packaging, or missing portions).');
      return;
    }
    try {
      await claimsService.disputeClaim(disputeClaimId, user?.id || 'volunteer', disputeReason);
      setDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeClaimId(null);
      info('Task flagged as DISPUTED. Points held at 0 pending operational review.');
      await loadDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to record dispute');
    }
  };

  // Derived metrics
  const selectedTasks = availableTasks.filter((t) => selectedTaskIds.includes(t.id));
  const selectedPortionsTotal = selectedTasks.reduce((sum, t) => sum + t.portions, 0);
  const potentialPointsTotal = selectedTasks.reduce(
    (sum, t) => sum + calculateClaimPoints(t.portions, false),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-900 text-white">
              Volunteer Logistics Dispatch
            </span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {user?.city || 'Delhi NCR'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Welcome back, {user?.full_name || 'Ananya Sen'}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Active service corridor: <strong>{selectedCorridor}</strong> · Availability:{' '}
            <strong className="capitalize">{user?.availability || 'Flexible'}</strong>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Trip Planner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>2. Route Checklist & Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Points & Rewards</span>
            {rewardsSummary && rewardsSummary.points_pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Pickup Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Rescue Opportunities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-forest-900 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{availableTasks.length}</div>
          <div className="text-[11px] text-stone-500">Tasks near your planned trip</div>
        </div>

        {/* Pending Points */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Pending Points</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {rewardsSummary?.points_pending || 0} pts
          </div>
          <div className="text-[11px] text-stone-500">Awaiting two-party sign-off</div>
        </div>

        {/* Released Banked Points */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Released Points</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">
            {rewardsSummary?.points_released || 0} pts
          </div>
          <div className="text-[11px] text-stone-500">Verified by donor & NGO</div>
        </div>

        {/* Confirmed Rescues */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Verified Rescues</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900">
            {rewardsSummary?.verified_deliveries_count || 0}
          </div>
          <div className="text-[11px] text-stone-500">
            {rewardsSummary?.portions_transported_count || 0} portions delivered
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: VOLUNTEER TRIP PLANNER ("ON-MY-WAY FOOD RESCUE")        */}
      {/* ============================================================== */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Mission Explanation Banner */}
          <div className="bg-gradient-to-r from-forest-950 via-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Compass className="w-3.5 h-3.5" />
                  <span>On-My-Way Food Rescue · Commute Transport</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Carry food along trips you already plan to take
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  You don't need a dedicated delivery shift. Simply enter where you are starting and where you are heading. SharePlate identifies surplus food pick-ups and community shelters along your transit corridor so you can rescue food with minimal detour.
                </p>
              </div>

              {/* Corridor Quick Selectors */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs space-y-2 shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Quick Corridor Presets:
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleCorridorSelect(
                        'Delhi North-West Corridor',
                        'DTU Main Campus, Rohini Sector 17',
                        'Connaught Place Metro Hub, Central Delhi'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer ${
                      selectedCorridor === 'Delhi North-West Corridor'
                        ? 'bg-emerald-400 text-stone-950 shadow-xs'
                        : 'bg-white/10 text-stone-200 hover:bg-white/20'
                    }`}
                  >
                    <span>Delhi: Rohini → Connaught Place</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCorridorSelect(
                        'Mumbai Central Transit Corridor',
                        'BKC Commercial Hub, Bandra East',
                        'Ghatkopar East Transit Terminus'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer ${
                      selectedCorridor === 'Mumbai Central Transit Corridor'
                        ? 'bg-emerald-400 text-stone-950 shadow-xs'
                        : 'bg-white/10 text-stone-200 hover:bg-white/20'
                    }`}
                  >
                    <span>Mumbai: BKC → Kurla → Ghatkopar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCorridorSelect(
                        'Pune University Corridor',
                        'Deccan Gymkhana, FC Road',
                        'Shivajinagar Bus Station Hub'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer ${
                      selectedCorridor === 'Pune University Corridor'
                        ? 'bg-emerald-400 text-stone-950 shadow-xs'
                        : 'bg-white/10 text-stone-200 hover:bg-white/20'
                    }`}
                  >
                    <span>Pune: FC Road → Shivajinagar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Route Setup */}
          <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Step 1: Enter Origin & Destination</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Trip Starting Point (Origin)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    placeholder="e.g. Home or Workplace Address"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-forest-900 focus:outline-hidden"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    START
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Trip Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    placeholder="e.g. College, Metro Station, or Central Hub"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-forest-900 focus:outline-hidden"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    FINISH
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Rescue Tasks along Corridor */}
          <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>Step 2: Select Tasks to Carry (Checkboxes)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select one or more tasks along your corridor to bundle into your trip.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedCorridor(selectedCorridor === 'all' ? 'Mumbai Central Transit Corridor' : 'all')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-warm-300 text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                >
                  {selectedCorridor === 'all' ? 'Filter by Corridor' : 'Show All Regions'}
                </button>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-forest-900">
                  {selectedTaskIds.length} of {availableTasks.length} tasks selected
                </span>
              </div>
            </div>

            {availableTasks.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
                <PackageCheck className="w-8 h-8 text-stone-400 mx-auto" />
                <div className="font-bold text-stone-700">No rescue tasks found along this exact corridor</div>
                <div className="text-xs">
                  Donors in other areas or transit hubs may have surplus available right now.
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCorridor('all')}
                  className="text-xs font-bold text-forest-900 underline hover:text-forest-700 cursor-pointer"
                >
                  View all rescue tasks across all regions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskSelection(task.id)}
                      className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-forest-900 bg-emerald-50/40 shadow-xs'
                          : 'border-warm-200 hover:border-warm-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 text-forest-900">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-forest-900" />
                            ) : (
                              <Square className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                {task.category.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] font-bold text-forest-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                                {task.portions} portions
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-stone-900 mt-1">{task.title}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-600 bg-white p-3 rounded-xl border border-warm-200">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-stone-800">Pickup:</strong> {task.pickup_location}
                            <div className="text-[11px] text-stone-500">{task.pickup_address}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 pt-1 border-t border-warm-100">
                          <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-stone-800">Drop-off:</strong> {task.dropoff_location}
                            <div className="text-[11px] text-stone-500">{task.dropoff_address}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                        <span className="flex items-center gap-1 text-amber-800 font-semibold">
                          <Clock className="w-3 h-3" /> Pickup by{' '}
                          {new Date(task.pickup_deadline).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-bold text-forest-900">
                          +{calculateClaimPoints(task.portions, false)} pts potential
                        </span>
                      </div>

                      {task.pickup_instructions && (
                        <div className="text-[11px] text-stone-600 italic bg-warm-50 p-2 rounded-lg border border-warm-200">
                          "{task.pickup_instructions}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Route Stop Sequence & Map Schematic */}
          <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                  <span>Step 3: Route Stop Order & Preview</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Sequential stop order starting at your origin and finishing at your destination.
                </p>
              </div>

              {/* DEMO ROUTE PREVIEW BADGE */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Demo Route Preview</span>
              </div>
            </div>

            {/* Honest Routing Disclaimer */}
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Map Provider Disclosure:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                This schematic illustrates the sequential stop sequence along the active corridor. We do not fabricate live GPS, turn-by-turn navigation, traffic ETAs, or shortest-path calculations. Live map and distance calculation requires configuring a <strong>Mapbox</strong> or <strong>Google Maps Directions API</strong> key in environment variables.
              </p>
            </div>

            {/* Visual Route Stop Order */}
            <div className="space-y-3">
              {/* Origin */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-bold text-forest-950 uppercase text-[10px]">Trip Departure Origin</div>
                  <div className="text-stone-800 font-semibold">{originInput}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                  Start
                </span>
              </div>

              {/* Pickups */}
              {selectedTasks.map((t, idx) => (
                <div
                  key={`route-pick-${t.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 border border-warm-200 text-xs ml-4 sm:ml-6 border-l-4 border-l-amber-600"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {2 + idx}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-amber-900 uppercase text-[10px]">
                      Pickup Stop · {t.portions} portions
                    </div>
                    <div className="text-stone-900 font-semibold">{t.pickup_location}</div>
                    <div className="text-stone-500 text-[11px]">{t.pickup_address}</div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Dock Pickup
                  </span>
                </div>
              ))}

              {/* Deliveries */}
              {selectedTasks.map((t, idx) => (
                <div
                  key={`route-drop-${t.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 border border-warm-200 text-xs ml-4 sm:ml-6 border-l-4 border-l-blue-600"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {2 + selectedTasks.length + idx}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-blue-900 uppercase text-[10px]">
                      Drop-off Stop · Handover to Shelter
                    </div>
                    <div className="text-stone-900 font-semibold">{t.dropoff_location}</div>
                    <div className="text-stone-500 text-[11px]">{t.dropoff_address}</div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                    Shelter Delivery
                  </span>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {2 + selectedTasks.length * 2}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-blue-950 uppercase text-[10px]">Trip Destination Arrival</div>
                  <div className="text-stone-800 font-semibold">{destinationInput}</div>
                </div>
                <span className="text-[10px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-300">
                  Finish
                </span>
              </div>
            </div>

            {/* Route Summary Box & Accept CTA */}
            <div className="bg-stone-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-stone-400 font-semibold">Planned Route Summary:</div>
                <div className="text-sm font-bold text-stone-100">
                  {2 + selectedTasks.length * 2} Total Stops · {selectedPortionsTotal} Portions Rescued
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  Estimated Rewards: Up to {potentialPointsTotal} points (released after two-party verification)
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptRoute}
                disabled={selectedTaskIds.length === 0}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Accept Route & Open Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROUTE CHECKLIST & TWO-PARTY VERIFICATION ENGINE         */}
      {/* ============================================================== */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* 1. Map-Based Route for Assigned SharePlate Tasks */}
          {activeTripPlan && activeTripPlan.stops && activeTripPlan.stops.length > 0 ? (
            <TaskRouteMap
              stops={activeTripPlan.stops}
              corridorLabel={activeTripPlan.corridor_label || selectedCorridor}
              selectedStopId={selectedRouteStopId || undefined}
              onSelectStop={(id) => setSelectedRouteStopId(id)}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-warm-200 p-8 text-center space-y-4">
              <Compass className="w-10 h-10 text-emerald-700 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-stone-900">No Active Route Accepted Yet</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Head over to the <strong>Trip Planner</strong> tab to configure your personal commute endpoints, browse nearby surplus meal batches, and accept your route.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition"
              >
                Go to Trip Planner
              </button>
            </div>
          )}

          {/* 2. Stop-by-Stop Rescue Checklist */}
          {activeTripPlan && activeTripPlan.stops && activeTripPlan.stops.length > 0 && (
            <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Verified Execution
                  </span>
                  <h2 className="text-lg font-black text-stone-900 mt-1">
                    Stop-by-Stop Actions & Verification
                  </h2>
                  <p className="text-xs text-stone-500">
                    Personal commute travel is strictly segregated from SharePlate food actions. Pickups and deliveries must be individually verified.
                  </p>
                </div>

                <div className="text-xs font-bold text-stone-600">
                  Corridor: <strong>{activeTripPlan?.corridor_label || selectedCorridor}</strong>
                </div>
              </div>

              {/* Stop Items */}
              <div className="space-y-4">
                {activeTripPlan.stops.map((stop) => {
                  const isPersonal = stop.type === 'start' || stop.type === 'destination';
                  const isPickup = stop.type === 'pickup';
                  const isDelivery = stop.type === 'delivery';

                  const linkedClaim = !isPersonal
                    ? activeClaims.find(
                        (c) =>
                          c.id === stop.claim_id ||
                          c.donation_id === stop.task_id ||
                          c.donation?.id === stop.task_id
                      )
                    : null;

                  const claimId = linkedClaim?.id || stop.claim_id || '';
                  const isPickedUp =
                    Boolean(linkedClaim?.pickup_confirmed_at) ||
                    linkedClaim?.status === 'collected' ||
                    linkedClaim?.status === 'delivered';
                  const isDelivered =
                    linkedClaim?.status === 'delivered' ||
                    linkedClaim?.verification_status === 'verified';
                  const isDisputed = linkedClaim?.is_disputed;

                  const stopMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`;

                  return (
                    <div
                      key={stop.id}
                      id={stop.id}
                      className={`rounded-2xl border transition overflow-hidden ${
                        stop.completed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isPersonal
                          ? 'bg-stone-50 border-stone-200 shadow-xs'
                          : isPickup
                          ? 'bg-white border-amber-200 shadow-xs'
                          : 'bg-white border-blue-200 shadow-xs'
                      }`}
                    >
                      {/* Stop Header & Details */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white ${
                              stop.completed
                                ? 'bg-emerald-600'
                                : isPersonal
                                ? 'bg-stone-600'
                                : isPickup
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {stop.completed ? <CheckCircle2 className="w-4 h-4" /> : stop.sequence}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  isPersonal
                                    ? 'bg-stone-200 text-stone-700'
                                    : isPickup
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                                }`}
                              >
                                {isPersonal
                                  ? `Personal Commute (${stop.type === 'start' ? 'Origin' : 'Destination'})`
                                  : isPickup
                                  ? 'SharePlate Donor Kitchen Pickup'
                                  : 'SharePlate Recipient Shelter Delivery'}
                              </span>

                              {stop.portions && (
                                <span className="text-xs font-bold text-stone-800">
                                  {stop.food_title} ({stop.portions} portions)
                                </span>
                              )}
                            </div>

                            <div className="text-sm font-bold text-stone-900">{stop.name}</div>
                            <div className="text-xs text-stone-500">{stop.address}</div>

                            {/* External Directions Link Fallback */}
                            <div className="pt-1 flex items-center gap-3">
                              <a
                                href={stopMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-forest-900 hover:text-forest-950 inline-flex items-center gap-1"
                              >
                                <span>Directions in Google Maps</span>
                                <ExternalLink className="w-3 h-3 text-emerald-700" />
                              </a>

                              {stop.deadline && (
                                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" /> Pickup by: {new Date(stop.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>

                            {/* Unlocked Contact Details */}
                            {stop.contact_person && (
                              <div className="text-xs text-forest-900 font-semibold flex flex-wrap items-center gap-3 pt-1">
                                <span>Contact: <strong>{stop.contact_person}</strong></span>
                                {stop.phone && (
                                  <span className="flex items-center gap-1 text-stone-700">
                                    <Phone className="w-3 h-3 text-emerald-700" /> {stop.phone}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Handling Instructions */}
                            {stop.instructions && (
                              <div className="text-xs text-stone-600 italic bg-warm-50 p-2.5 rounded-xl border border-warm-200 mt-1 max-w-xl">
                                "{stop.instructions}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge on right */}
                        <div className="self-start sm:self-center shrink-0">
                          {stop.completed ? (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                            </span>
                          ) : isPersonal ? (
                            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
                              Commute Leg
                            </span>
                          ) : isPickup ? (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                              Awaiting Pickup
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                              Awaiting Drop-off
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Bar for this specific stop */}
                      <div className="bg-warm-50/70 p-4 border-t border-warm-200/80">
                        {/* CASE 1: PERSONAL COMMUTE LEG */}
                        {isPersonal && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-[11px] text-stone-500 italic">
                              Personal commute travel · Does not advance, complete, or alter any food rescue claim.
                            </p>
                            {stop.completed ? (
                              <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                                Personal Travel Acknowledged
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCompletePersonalStop(stop.id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Acknowledge Commute {stop.type === 'start' ? 'Departure' : 'Arrival'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* CASE 2: SHAREPLATE DONOR PICKUP STOP */}
                        {isPickup && (
                          <div className="space-y-3">
                            {isPickedUp ? (
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="font-bold flex items-center gap-1 text-emerald-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Food Handover Confirmed by Donor Kitchen</span>
                                  </div>
                                  <div className="text-[11px] text-stone-600">
                                    Confirmed by: <strong>{linkedClaim?.pickup_confirmed_by || stop.contact_person || 'Donor Kitchen'}</strong>
                                    {linkedClaim?.pickup_confirmed_at && (
                                      <span> at {new Date(linkedClaim.pickup_confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-center">
                                  In Transit to Shelter
                                </span>
                              </div>
                            ) : linkedClaim?.verification_status === 'pickup_pending' ? (
                              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                                    <span>Awaiting Donor Handover Confirmation</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                                    Valid 15m · Attempts: {linkedClaim?.pickup_attempts || 0}/3
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                      Your Pickup Handover OTP:
                                    </div>
                                    <div className="text-2xl font-mono font-black text-forest-950 tracking-widest mt-0.5">
                                      {linkedClaim?.pickup_code || '4821'}
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-stone-600 sm:text-right max-w-xs leading-relaxed">
                                    Present this 4-digit code to donor staff. The donor verifies and releases food from their own authenticated portal.
                                  </p>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] text-stone-500 italic">
                                    Volunteer cannot self-confirm on behalf of donor.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleVolunteerInitiatePickup(claimId)}
                                    className="text-[11px] font-bold text-forest-900 hover:underline cursor-pointer"
                                  >
                                    Re-generate Pickup Code
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
                                <div>
                                  <p className="text-xs font-bold text-stone-800">
                                    Arrived at {stop.name || 'Donor Kitchen'}?
                                  </p>
                                  <p className="text-[11px] text-stone-500 mt-0.5">
                                    Initiate handover to generate your secure 4-digit pickup code for the donor staff.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleVolunteerInitiatePickup(claimId)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                  <span>Initiate Pickup Handover</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CASE 3: SHAREPLATE RECIPIENT DELIVERY STOP */}
                        {isDelivery && (
                          <div className="space-y-3">
                            {isDelivered ? (
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="font-bold flex items-center gap-1 text-emerald-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Verified Delivery by Recipient NGO</span>
                                  </div>
                                  <div className="text-[11px] text-stone-600">
                                    {linkedClaim?.portions_delivered_confirmed || stop.portions} portions confirmed by <strong>{linkedClaim?.delivery_confirmed_by || stop.contact_person || 'Recipient Coordinator'}</strong>
                                  </div>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-center">
                                  +{linkedClaim?.points_released || calculateClaimPoints(stop.portions || 10, false)} pts Awarded
                                </span>
                              </div>
                            ) : isPickedUp ? (
                              linkedClaim?.verification_status === 'delivery_pending' ? (
                                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-300 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 text-blue-700 animate-pulse" />
                                      <span>Awaiting Recipient NGO Receipt Confirmation</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                                      Valid 15m · Attempts: {linkedClaim?.delivery_attempts || 0}/3
                                    </span>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Your Delivery Verification OTP:
                                      </div>
                                      <div className="text-2xl font-mono font-black text-blue-950 tracking-widest mt-0.5">
                                        {linkedClaim?.delivery_code || '7392'}
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-stone-600 sm:text-right max-w-xs leading-relaxed">
                                      Present this 4-digit code to recipient NGO coordinator. The NGO verifies portions and confirms receipt in their portal to release your points.
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleVolunteerInitiateDelivery(claimId)}
                                      className="text-[11px] font-bold text-blue-900 hover:underline cursor-pointer"
                                    >
                                      Re-generate Delivery Code
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDisputeClaimId(claimId);
                                        setDisputeModalOpen(true);
                                      }}
                                      className="text-[11px] font-semibold text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer"
                                    >
                                      Flag Dispute / Issue
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
                                  <div>
                                    <p className="text-xs font-bold text-stone-800">
                                      Arrived at {stop.name || 'Recipient Shelter'}?
                                    </p>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                      Initiate handoff to generate your 4-digit delivery code for the NGO coordinator.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleVolunteerInitiateDelivery(claimId)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                                  >
                                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                                    <span>Initiate Delivery Handoff</span>
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Awaiting Donor Kitchen Pickup. Complete pickup at stop #{stop.sequence - 1} before delivering to shelter.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TWO-PARTY VERIFICATION & HANDOVER PANELS */}
          <div className="space-y-4">
            <div className="border-b border-warm-200 pb-2">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Two-Party Verification Engine</span>
              </h2>
              <p className="text-xs text-stone-600">
                <strong>Strict Verification Rule:</strong> Points are NOT released when a volunteer accepts a route or clicks complete. Release requires separate, attributable confirmations from the donor at pickup and the recipient NGO at drop-off.
              </p>
            </div>

            {activeClaims.length === 0 ? (
              <div className="bg-white rounded-3xl border border-warm-200 p-8 text-center text-xs text-stone-500">
                No active delivery claims assigned. Accept a route in the Trip Planner tab to start.
              </div>
            ) : (
              activeClaims.map((claim) => {
                const isVerified = claim.verification_status === 'verified';
                const isDisputed = claim.is_disputed || claim.verification_status === 'disputed';
                const isPickupPending =
                  claim.verification_status === 'pickup_pending' || claim.status === 'claimed';
                const isInTransit =
                  claim.verification_status === 'in_transit' || claim.status === 'collected';
                const isDeliveryPending = claim.verification_status === 'delivery_pending';

                return (
                  <div
                    key={claim.id}
                    className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-5"
                  >
                    {/* Header with Title & Verification State */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              isVerified
                                ? 'bg-emerald-100 text-forest-900'
                                : isDisputed
                                ? 'bg-rose-100 text-rose-900'
                                : isInTransit
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            State: {claim.verification_status?.replace('_', ' ') || claim.status}
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            Claim ID: {claim.id.slice(0, 12)}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-stone-900 mt-1">
                          {claim.donation?.title || 'Rescued Food Batch'}
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-stone-900">
                          {claim.quantity_claimed} portions reserved
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Potential reward: {calculateClaimPoints(claim.quantity_claimed, false)} pts
                        </div>
                      </div>
                    </div>

                    {/* TWO STEP VERIFICATION CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* STEP 1: PICKUP VERIFICATION (DONOR HANDOVER) */}
                      <div
                        className={`p-4 rounded-2xl border space-y-3 ${
                          claim.pickup_confirmed_at
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-warm-50 border-warm-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-700" />
                            <span>1. Donor Kitchen Pickup</span>
                          </span>
                          {claim.pickup_confirmed_at ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Confirmed
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              Pending Handover
                            </span>
                          )}
                        </div>

                        {/* One-Time Pickup Code */}
                        <div className="bg-white p-3 rounded-xl border border-warm-200 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            One-Time Pickup Verification Code:
                          </div>
                          <div className="text-lg font-mono font-black text-forest-900 tracking-widest">
                            {claim.pickup_code || '4821'}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Show this code to donor staff at kitchen dock to confirm handover.
                          </div>
                        </div>

                        {claim.pickup_confirmed_at ? (
                          <div className="text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Attributable Confirmation:</span>
                            </div>
                            <div className="text-[11px] text-stone-700">
                              Confirmed by: <strong>{claim.pickup_confirmed_by || 'Priya Sharma (DTU Canteen)'}</strong>
                            </div>
                            <div className="text-[10px] text-stone-500">
                              Time: {new Date(claim.pickup_confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-warm-100/70 rounded-xl border border-warm-200 text-xs text-stone-600 space-y-1">
                            <p className="font-bold text-stone-800">Two-Party Authentication Rule:</p>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              Volunteers cannot self-confirm donor handover. The donor kitchen verifies and releases food using the 4-digit code above from their authenticated donor portal.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* STEP 2: DELIVERY VERIFICATION (NGO RECEIPT) */}
                      <div
                        className={`p-4 rounded-2xl border space-y-3 ${
                          claim.delivery_confirmed_at
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : isDisputed
                            ? 'bg-rose-50/50 border-rose-300'
                            : 'bg-warm-50 border-warm-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-700" />
                            <span>2. Recipient NGO Delivery</span>
                          </span>
                          {claim.delivery_confirmed_at ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Verified
                            </span>
                          ) : isDisputed ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                              Disputed
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-md">
                              Awaiting Delivery
                            </span>
                          )}
                        </div>

                        {/* One-Time Delivery Code */}
                        <div className="bg-white p-3 rounded-xl border border-warm-200 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            One-Time Delivery Verification Code:
                          </div>
                          <div className="text-lg font-mono font-black text-blue-900 tracking-widest">
                            {claim.delivery_code || '7392'}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Recipient coordinator checks meals and confirms receipt in their portal.
                          </div>
                        </div>

                        {claim.delivery_confirmed_at ? (
                          <div className="text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Attributable Confirmation:</span>
                            </div>
                            <div className="text-[11px] text-stone-700">
                              Confirmed by: <strong>{claim.delivery_confirmed_by || 'Rajesh Kumar (Robin Hood Army)'}</strong>
                            </div>
                            <div className="text-[11px] text-stone-700">
                              Portions received: <strong>{claim.portions_delivered_confirmed || claim.quantity_claimed} portions</strong>
                            </div>
                            <div className="text-[10px] text-forest-900 font-bold pt-1">
                              ✓ Points Released: {claim.points_released || calculateClaimPoints(claim.portions_delivered_confirmed || claim.quantity_claimed, false)} pts
                            </div>
                          </div>
                        ) : isDisputed ? (
                          <div className="text-xs text-rose-900 bg-rose-100/60 p-2.5 rounded-xl border border-rose-300 space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                              <span>Disputed Delivery (0 Points):</span>
                            </div>
                            <div className="text-[11px] text-stone-800 italic">
                              "{claim.dispute_reason || 'Food damaged or spoiled during transit.'}"
                            </div>
                            <div className="text-[10px] text-stone-500">
                              Flagged by: {claim.disputed_by || 'Recipient NGO'} · Points Held at 0
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-3 bg-warm-100/70 rounded-xl border border-warm-200 text-xs text-stone-600 space-y-1">
                              <p className="font-bold text-stone-800">Two-Party Authentication Rule:</p>
                              <p className="text-[11px] text-stone-600 leading-relaxed">
                                Volunteers cannot self-confirm delivery. The recipient NGO coordinator verifies portion count and signs off using the code above from their authenticated recipient portal.
                              </p>
                            </div>

                            {/* Dispute trigger button */}
                            <button
                              type="button"
                              onClick={() => {
                                setDisputeClaimId(claim.id);
                                setDisputeModalOpen(true);
                              }}
                              className="w-full px-2 py-1.5 rounded-xl text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                            >
                              Flag Delivery Dispute / Damaged Food
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: VOLUNTEER REWARDS & POINTS LEDGER                       */}
      {/* ============================================================== */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Milestone & Tier Progression */}
          <div className="bg-gradient-to-r from-forest-950 via-purple-950 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-purple-800/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Verified Volunteer Recognition</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Current Rank: {rewardsSummary?.current_tier || 'Bronze Courier'}
                </h2>
                <p className="text-xs text-stone-300">
                  Points are released strictly upon two-party verification. Never on task acceptance.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Total Released Points:
                </div>
                <div className="text-3xl font-black text-white mt-0.5">
                  {rewardsSummary?.points_released || 0}
                </div>
                <div className="text-[10px] text-stone-400">Banked in points ledger</div>
              </div>
            </div>

            {/* Progress bar towards next tier */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-stone-300 font-semibold">
                <span>Progress to Next Tier</span>
                <span>
                  {rewardsSummary?.points_released || 0} / {rewardsSummary?.next_tier_threshold || 600} pts
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((rewardsSummary?.points_released || 0) /
                        (rewardsSummary?.next_tier_threshold || 600)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transparent Formula Callout */}
          <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Transparent Points Formula & Rules</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900">Base Award:</span>
                <p className="text-stone-600">
                  <strong>50 points</strong> awarded per verified completed rescue delivery.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900">Portions Rescued:</span>
                <p className="text-stone-600">
                  <strong>+2 points</strong> per confirmed portion received by recipient NGO.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900">Delivery Cap:</span>
                <p className="text-stone-600">
                  Max <strong>150 points</strong> per task to prevent system gaming via batch splitting.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-stone-500 italic">
              Disputed deliveries, expired food, or cancelled trips receive 0 points. Partial deliveries earn points strictly based on the confirmed delivered quantity.
            </div>
          </div>

          {/* Corporate Partner Reward / Amazon Voucher Concept Disclaimer */}
          <div className="bg-purple-50 rounded-3xl border border-purple-200 p-6 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-purple-950">
                    Potential Future Partner Rewards (Illustrative Example Only)
                  </h4>
                  <span className="text-[10px] font-bold uppercase bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">
                    Future Concept
                  </span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Amazon gift vouchers, petrol reimbursement credits, and local retail discounts represent a <strong>future corporate partner incentive program</strong>. SharePlate does not offer cash conversion, and no active Amazon voucher fulfillment contract exists. All displayed points and redemption samples are illustrative demo data.
                </p>
              </div>
            </div>
          </div>

          {/* Points History Ledger Table */}
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-900">Points History & Audit Ledger</h3>
                <p className="text-xs text-stone-500">
                  Immutable record of two-party verified deliveries and points awarded.
                </p>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {rewardsSummary?.history.length || 0} entries
              </span>
            </div>

            <div className="divide-y divide-warm-100">
              {rewardsSummary?.history.map((record) => (
                <div
                  key={record.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-warm-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          record.status === 'released'
                            ? 'bg-emerald-100 text-forest-900'
                            : record.status === 'forfeited'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {record.status}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{record.donation_title}</span>
                    </div>
                    <div className="text-xs text-stone-600">{record.reason}</div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(record.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      · Recipient: {record.recipient_name}
                    </div>
                  </div>

                  <div className="self-end sm:self-center text-right shrink-0">
                    <div
                      className={`text-base font-black ${
                        record.status === 'released'
                          ? 'text-forest-900'
                          : record.status === 'forfeited'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {record.status === 'released' ? `+${record.points} pts` : '0 pts'}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {record.portions_confirmed} portions verified
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-black text-stone-900">Report Delivery Issue / Dispute</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              If food was spoiled, packaging damaged, temperature compromised, or portions are missing, record a dispute. Disputed tasks award <strong>0 points</strong> until reviewed.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Dispute Reason:</label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="e.g. 10 portions leaked due to damaged container; temperature cold upon arrival."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDisputeModalOpen(false);
                  setDisputeReason('');
                  setDisputeClaimId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisputeTask}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition cursor-pointer"
              >
                Submit Dispute (0 Points)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
