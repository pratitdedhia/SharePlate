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
  Server,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const defaultNotionUrl = 'https://app.notion.com/p/SharePlate-Hacktober-HackDays-2026-Report-40471fac0e5c813cb0d3de560f29a8aa?source=copy_link';
  const notionUrl = (import.meta.env.VITE_NOTION_URL || defaultNotionUrl).trim();
  const hasNotionUrl = Boolean(notionUrl && !notionUrl.includes('<<FILL'));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-forest-900 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Hacktober HackDays 2026 · Tech for Social Good · SheBuilds Delhi
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          About SharePlate
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
          Rescuing surplus food from commercial kitchens and redirecting it to community shelters before it spoils.
        </p>
      </div>

      {/* Honest Architecture & Demo Mode Notice */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
          <Server className="w-5 h-5 text-emerald-700" />
          Deployment Architecture & Demo Mode Notice
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <strong>Transparent Architecture:</strong> This live demo is hosted as a static Single Page Application on GitHub Pages.
          Data generated during your session is stored locally in your browser memory (<code className="bg-warm-100 px-1 py-0.5 rounded font-mono text-xs">demoStore</code>).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1 text-xs">
            <span className="font-bold text-forest-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Deployed Live Demo
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Vite + React 18 frontend with direct Cloudinary CDN integration (unsigned upload preset for static hosts), responsive image transformations, and interactive client-side claim validation.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1 text-xs">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-stone-700" /> Production Repository Stack
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              The monorepo contains a full Express REST API (<code className="font-mono">apps/api</code>) and PostgreSQL/Supabase schema (<code className="font-mono">supabase/</code>) featuring Row-Level Security and atomic double-claim prevention (<code className="font-mono">claim_donation_atomic</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Problem & Reality in India */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-stone-900">The Problem We Are Solving</h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          In urban India, millions of portions of freshly prepared, wholesome food from college canteens, corporate
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
              <strong>Direct Unsigned Upload Preset (Deployed Demo):</strong> Allows secure browser-to-Cloudinary uploads on static hosting like GitHub Pages without exposing API secrets.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Cryptographically Signed Uploads (API Path):</strong> When running with the Express backend, uses server-generated SHA-256 signatures for authenticated uploads into user-scoped directories.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Automatic Responsive Format & Quality:</strong> Images are delivered using <code className="text-emerald-300">f_auto,q_auto,c_fill,g_auto</code> with responsive <code className="text-emerald-300">srcset</code> breakpoints (400w, 800w, 1200w).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>Real Bandwidth Savings Measurement:</strong> The client measures delivered asset payloads dynamically against original file sizes.
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
            <strong>1. Mandatory Timestamps & Pickup Deadlines:</strong> Donors state preparation time and consume-within windows. Listings automatically expire once deadlines pass.
          </div>
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
            <strong>2. Allergen & Storage Notes:</strong> Donors provide allergen declarations and storage temperature notes (e.g. thermal holding).
          </div>
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
            <strong>3. Recipient Verification:</strong> Shelters inspect food temperature and organoleptic properties before community distribution.
          </div>
        </div>
      </div>

      {/* Notion Journey Reference */}
      <div className="bg-warm-100 p-8 rounded-3xl border border-warm-200 text-center space-y-4">
        <BookOpen className="w-8 h-8 text-forest-900 mx-auto" />
        <h3 className="text-lg font-bold text-stone-900">Documented on Notion</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          Our entire product development journey, architectural decisions, and testing protocols are structured
          for Notion in accordance with Hacktober HackDays 2026 submission requirements.
        </p>

        {hasNotionUrl ? (
          <div className="pt-2">
            <a
              href={notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 transition shadow-sm"
            >
              <span>View Project Journey on Notion</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="pt-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
              See docs/notion/ in repository for all 13 complete subpages (set VITE_NOTION_URL for direct link)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
