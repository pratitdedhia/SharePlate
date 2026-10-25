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
  const notionUrl = import.meta.env.VITE_NOTION_URL;

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

      <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs text-amber-950" role="note">
        <strong>Demo mode:</strong> donation and claim data is stored in this browser. Supabase and Express are the production architecture in this repository; they are not deployed in this demo.
      </div>

      {/* Problem & Reality in India */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-stone-900">The Problem We Are Solving</h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          In urban India, millions of portions of freshly prepared, untouched food from college canteens, corporate
          cafeterias, marriage caterers, and bakeries are discarded every single day due to lack of immediate,
          reliable coordination with local NGOs. Meanwhile, community shelters struggle daily with grocery costs.
        </p>
        <p className="text-xs text-stone-500 border-t border-warm-200 pt-4">
          This is the product's problem framing, not a measured result from the SharePlate demo. Quantitative research claims are intentionally omitted until their source and scope are verified.
        </p>
      </div>

      {/* Cloudinary Integration Section */}
      <div className="bg-emerald-950 text-white p-8 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <CloudLightning className="w-4 h-4 text-emerald-400" />
          Mandatory Hackathon Technology
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">How SharePlate Uses Cloudinary</h2>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
          When the public Cloudinary cloud name and unsigned preset are configured, the deployed static demo uploads directly to Cloudinary. If the API runs with Cloudinary configured, the signed upload path is used first. Without either configuration, the image remains a labeled local preview.
        </p>
        <ul className="space-y-2.5 text-xs text-emerald-100/90 pt-1">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Upload options:</strong> The static demo uses an unsigned upload preset; the Express API can issue signed upload parameters. The Cloudinary API secret is never included in browser code.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Responsive delivery:</strong> Cloudinary-hosted listing images request <code className="text-emerald-300">c_fill,g_auto,f_auto,q_auto</code> variants at responsive widths. The uploader displays measured delivered bytes when the transformed image can be fetched.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Client validation:</strong> The uploader accepts JPEG, PNG, and WebP files up to 5 MB. This client-side check does not replace server-side policy enforcement.
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
        {notionUrl && <a href={notionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline">Project Journey (Notion) <ExternalLink className="w-3 h-3" /></a>}
      </div>
    </div>
  );
};
