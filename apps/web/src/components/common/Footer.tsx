import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-100 border-t border-warm-200 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-forest-950">SharePlate</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              A community food rescue platform connecting college canteens, restaurants, and caterers with nearby NGOs
              to redirect surplus food before it goes to waste.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100/80 text-forest-900 border border-emerald-200">
                ⚡ Powered by Cloudinary
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-950 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link to="/donations" className="hover:text-forest-900 transition">
                  Browse Food Listings
                </Link>
              </li>
              <li>
                <Link to="/donations/new" className="hover:text-forest-900 transition">
                  Donate Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-forest-900 transition">
                  Impact & Carbon Metrics
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-forest-900 transition">
                  Role Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon Context */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-950 mb-3">Hackathon Context</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="font-medium text-forest-900">Hacktober HackDays 2026</li>
              <li>SheBuilds Delhi Chapter · Powered by MLH</li>
              <li>Theme: Tech for Social Good</li>
              <li>Team Size: 4 Student Engineers</li>
              <li>
                <Link to="/about" className="hover:text-forest-900 transition inline-flex items-center gap-1">
                  Read Development Journey <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Food Safety & Responsibility Notice */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Food Safety Responsibility</span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              SharePlate is a communication platform facilitating food rescue. SharePlate does not certify or inspect
              food safety. Donors are solely responsible for providing accurate ingredient, allergen, and freshness
              information. Recipients must ensure temperature-safe collection and adherence to local hygiene
              guidelines.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-warm-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 SharePlate. Built with care for Hacktober HackDays 2026.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-stone-800 transition">
              About & Team
            </Link>
            <span className="text-stone-300">·</span>
            <span>Made with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for Social Impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
