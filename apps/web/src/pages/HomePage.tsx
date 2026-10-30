import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  ChevronRight,
  Leaf,
  Clock,
  LogIn,
  UserPlus,
  Truck,
  Building,
  Utensils,
} from 'lucide-react';
import { donationsService } from '../services/donations';
import { impactService } from '../services/impact';
import { Donation, ImpactMetrics, UserRole } from '../types';
import { DonationGrid } from '../components/donations/DonationGrid';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { user, loginDemoRole } = useAuth();
  const navigate = useNavigate();
  const [featuredDonations, setFeaturedDonations] = useState<Donation[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [donationsRes, metricsRes] = await Promise.all([
          donationsService.getDonations({ limit: 3, status: 'available' }),
          impactService.getImpactSummary(),
        ]);
        setFeaturedDonations(donationsRes.data);
        setImpactMetrics(metricsRes);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleQuickDemo = async (role: UserRole) => {
    await loginDemoRole(role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
        {/* Soft background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center px-4 space-y-6">
          {/* Hackathon Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-forest-900 border border-emerald-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hacktober HackDays 2026 · SheBuilds Delhi Chapter · Powered by MLH</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
            Rescue Food. <span className="text-forest-900 underline decoration-emerald-400 decoration-wavy">Reduce Waste.</span>
            <br />
            Feed Communities.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            SharePlate connects college canteens, corporate caterers, and restaurants with local NGOs and community
            kitchens to redirect wholesome surplus meals within hours—not landfills.
          </p>

          {/* Primary Landing Page Funnel: Sign In or Register */}
          <div className="space-y-4 pt-2">
            {user ? (
              <div className="p-4 rounded-2xl bg-white border border-warm-200 shadow-xs max-w-md mx-auto space-y-3">
                <div className="text-xs text-stone-600">
                  Signed in as <strong className="text-stone-900">{user.full_name}</strong> (
                  <span className="text-emerald-700 font-bold uppercase">{user.role}</span>)
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    to={`/dashboard/${user.role}`}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                  <Link
                    to="/donations"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-warm-100 text-stone-800 hover:bg-warm-200 transition"
                  >
                    Browse Food
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold bg-white text-forest-900 hover:bg-emerald-50 border-2 border-emerald-300 shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-700" />
                    Register Free
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-md transition flex items-center justify-center gap-2 group"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
                    Portal Login
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-semibold text-stone-500 pt-1">
                  <Link to="/donations" className="hover:text-stone-900 transition flex items-center gap-1">
                    Browse live batches as guest <ArrowRight className="w-3 h-3 text-emerald-600" />
                  </Link>
                  <span>·</span>
                  <Link to="/impact" className="hover:text-stone-900 transition">
                    Public impact data
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Demonstration Trust Metrics Strip */}
          {impactMetrics && (
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 text-center">Demonstration Dataset Metrics · Calculated in Real Time</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-warm-200 shadow-xs text-center">
                <div className="text-2xl font-black text-stone-900">{impactMetrics.portionsDelivered}</div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Portions Delivered</div>
              </div>
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-warm-200 shadow-xs text-center">
                <div className="text-2xl font-black text-stone-900">{impactMetrics.activeDonors}</div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Active Donors</div>
              </div>
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-warm-200 shadow-xs text-center">
                <div className="text-2xl font-black text-stone-900">{impactMetrics.participatingRecipients}</div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Partner NGOs</div>
              </div>
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-warm-200 shadow-xs text-center">
                <div className="text-2xl font-black text-emerald-700">~{impactMetrics.estimatedCo2eSavedKg} kg</div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">CO₂e Avoided</div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Live Food Inventory Section (Prominently listed on landing page) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-forest-900 mb-1 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Rescue Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Available Food Batches</h2>
            <p className="text-xs text-stone-500 mt-0.5">Fresh surplus meals ready for immediate NGO collection.</p>
          </div>
          <Link
            to="/donations"
            className="text-xs font-bold text-forest-900 hover:text-emerald-700 flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-warm-200 shadow-2xs hover:shadow-xs transition"
          >
            Explore all listings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <DonationGrid donations={featuredDonations} emptyMessage="No active listings currently available." />
        )}
      </section>

      {/* Role Portal Entry Cards (Login or Register by Role - Only shown to Guests) */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Dedicated Portals</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Join the Food Rescue Mission</h2>
            <p className="text-xs text-stone-600 mt-1">Select your role to access your dedicated portal or register your organization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Donor Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-warm-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest-900 flex items-center justify-center font-bold">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Canteens & Donors</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Publish daily surplus meal batches in 60 seconds with food photos and coordinate atomic, double-claim-proof shelter collections.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 transition flex items-center justify-center gap-1.5"
                >
                  Sign In as Donor <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-forest-900 hover:bg-emerald-100 border border-emerald-200 transition text-center block"
                >
                  Register New Canteen
                </Link>
              </div>
            </div>

            {/* Recipient Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-warm-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Shelters & NGOs</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Inspect food ingredients and packaging photos, claim exact needed portions, and unlock protected gate pickup instructions.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition flex items-center justify-center gap-1.5"
                >
                  Sign In as Recipient <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition text-center block"
                >
                  Register Partner NGO
                </Link>
              </div>
            </div>

            {/* Volunteer Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-warm-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Volunteer Logistics</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Receive active dispatch routes, verify thermal packaging at canteen ramps, and confirm meal delivery to local community kitchens.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-900 text-white hover:bg-purple-800 transition flex items-center justify-center gap-1.5"
                >
                  Sign In as Volunteer <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 transition text-center block"
                >
                  Join Volunteer Fleet
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How SharePlate Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            How Surplus Food Gets Rescued
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Designed for speed so hot meals reach community shelters while fresh and safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-forest-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
              01
            </div>
            <h3 className="text-base font-bold text-stone-900">Donor Posts Listing</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Canteen or caterer enters portion count, food category, pickup deadline, and uploads a Cloudinary-optimized photo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-forest-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
              02
            </div>
            <h3 className="text-base font-bold text-stone-900">NGO Reserves Portions</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Nearby recipient NGO reserves needed portions atomically. Concurrency-safe reservations prevent overselling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-forest-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
              03
            </div>
            <h3 className="text-base font-bold text-stone-900">Protected Pickup</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Specific pickup instructions and contact details are securely revealed only to the authorized claimant.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-forest-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
              04
            </div>
            <h3 className="text-base font-bold text-stone-900">Confirmed Delivery</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Recipient confirms receipt upon handoff. Live platform metrics update with actual rescued meals and carbon offsets.
            </p>
          </div>
        </div>
      </section>

      {/* Food Safety & Responsibility Principles Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/80 rounded-3xl border border-amber-200 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              Factual Food Safety & Mutual Responsibility
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              SharePlate is a community coordination platform. We do not certify food safety. Donors must provide truthful
              ingredient, allergen, and preparation timestamps. Recipient organizations must inspect food quality upon
              pickup and maintain hygienic, temperature-safe distribution.
            </p>
          </div>

          <Link
            to="/about"
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-900 text-white hover:bg-amber-950 transition"
          >
            Read Safety Principles
          </Link>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 relative overflow-hidden shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Have Surplus Food from Today's Service?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Don't throw away edible meals. In less than two minutes, list your excess portions and connect with an NGO
            ready to collect them.
          </p>
          <div className="pt-2">
            <Link
              to="/donations/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-emerald-400 text-forest-950 hover:bg-emerald-300 transition shadow-sm"
            >
              Create a Food Donation Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
