import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Building, MapPin, Phone, ShieldCheck, Mail, Loader2, Save } from 'lucide-react';
import { INDIAN_STATES, STATE_CITIES_MAP, inferStateFromCity } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [orgName, setOrgName] = useState(user?.organization_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || inferStateFromCity(user?.city) || 'Delhi');
  const [city, setCity] = useState(user?.city || 'Delhi NCR');
  const [serviceArea, setServiceArea] = useState(user?.service_area || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setOrgName(user.organization_name || '');
      setPhone(user.phone || '');
      setState(user.state || inferStateFromCity(user.city) || 'Delhi');
      setCity(user.city || 'Delhi NCR');
      setServiceArea(user.service_area || '');
    }
  }, [user]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const availableCities = STATE_CITIES_MAP[newState];
    if (availableCities && availableCities.length > 0) {
      setCity(availableCities[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full Name is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        organization_name: orgName.trim() || null,
        phone: phone.trim() || null,
        state: state,
        city: city,
        service_area: serviceArea.trim() || null,
      });
      success('Profile updated successfully!');
    } catch (err: any) {
      error(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Manage your organizational contact details, city, and active food distribution service areas.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-warm-100">
          <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-xs">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-emerald-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">{user?.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-900 text-white">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {user?.organization_name || 'Individual Contributor'} · {user?.city || city}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number (Protected)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">Shared only with active claim participants</span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">State / Territory</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden font-medium"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">City / Base Region</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              >
                {(STATE_CITIES_MAP[state] || ['Delhi NCR']).map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Primary Neighborhood / Service Area</label>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Rohini & Pitampura or Bandra to Andheri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 disabled:opacity-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
