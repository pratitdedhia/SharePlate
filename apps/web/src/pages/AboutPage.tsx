import React from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  Leaf,
  Users,
  Sparkles,
  ExternalLink,
  BookOpen,
  CloudLightning,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-forest-900 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Hacktober HackDays 2026 · Tech for Social Good
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          About SharePlate
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
          Rescuing surplus food from commercial kitchens and redirecting it to community shelters before it spoils.
        </p>
      </div>

      {/* Problem & Reality in India */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-stone-900">The Problem We Are Solving</h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          In urban India, millions of portions of freshly prepared, untouched food from college canteens, corporate
          cafeterias, marriage caterers, and bakeries are discarded every single day due to lack of immediate,
          reliable coordination with local NGOs. Meanwhile, community shelters struggle daily with grocery costs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="text-2xl font-black text-forest-900">~68M Tonnes</span>
            <span className="text-xs font-semibold text-stone-800 block">Food Wasted Annually in India</span>
            <p className="text-[11px] text-stone-500">According to UNEP Food Waste Index Report benchmarks.</p>
          </div>
          <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="text-2xl font-black text-emerald-700">8–10%</span>
            <span className="text-xs font-semibold text-stone-800 block">Global Greenhouse Gases</span>
            <p className="text-[11px] text-stone-500">Methane emissions generated when food rots in open landfills.</p>
          </div>
        </div>
      </div>

      {/* Cloudinary Integration Section */}
      <div className="bg-emerald-950 text-white p-8 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <CloudLightning className="w-4 h-4 text-emerald-400" />
          Mandatory Hackathon Technology
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">How SharePlate Uses Cloudinary</h2>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
          High-quality visual verification is crucial for recipients to assess food condition, hygiene, and packaging.
          SharePlate integrates Cloudinary end-to-end:
        </p>
        <ul className="space-y-2.5 text-xs text-emerald-100/90 pt-1">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Cryptographically Signed Uploads:</strong> The Express API server generates constrained SHA signatures
              for user-scoped folders (<code className="text-emerald-300">shareplate/donations/:userId</code>), protecting API secrets.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Automatic Responsive Format & Quality:</strong> Images are served with Cloudinary's dynamic <code className="text-emerald-300">f_auto,q_auto</code> transformations, reducing mobile payload sizes by up to 70%.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Enforced Size & Type Restrictions:</strong> Prevents malicious uploads by restricting payloads to validated image formats under 5MB.
            </span>
          </li>
        </ul>
      </div>

      {/* Food Safety & Responsible Use Principles */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-800 text-sm font-bold">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          Food Safety Principles
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          SharePlate provides the real-time communication infrastructure to redistribute surplus meals. To maintain
          food safety without certifying food quality:
        </p>
        <div className="space-y-3 text-xs text-stone-700 pt-1">
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
            <strong>1. Mandatory Timestamps:</strong> Donors must state when food was cooked and establish realistic pickup deadlines (typically 2–4 hours for cooked items).
          </div>
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
            <strong>2. Allergen Declarations:</strong> Common allergens (dairy, gluten, nuts) must be noted so community shelters distribute safely.
          </div>
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
            <strong>3. Recipient Inspection:</strong> Shelters must inspect temperature and sensory qualities upon handover.
          </div>
        </div>
      </div>

      {/* Notion Journey Reference */}
      <div className="bg-warm-100 p-8 rounded-3xl border border-warm-200 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-forest-900 mx-auto" />
        <h3 className="text-lg font-bold text-stone-900">Documented on Notion</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          Our entire product development journey, architectural decisions, and testing protocols are structured
          for Notion in accordance with Hacktober HackDays 2026 submission guidelines.
        </p>
        <div className="pt-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
            See docs/notion/ in repository for all 12 complete subpages
          </span>
        </div>
      </div>
    </div>
  );
};
