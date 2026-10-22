import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, Ban } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success } = useToast();

  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      reporter_name: 'Sneha Patil (Feeding India Mumbai)',
      donation_title: 'Surplus Lunch Buffet Trays',
      reason: 'Incorrect temperature storage disclosure',
      status: 'investigating',
      created_at: '2026-10-22T14:30:00Z',
    },
    {
      id: 'rep-2',
      reporter_name: 'Manoj Joshi (Pune Roti Bank)',
      donation_title: 'Cooked Rice & Dal Pots',
      reason: 'Pickup contact did not answer phone at loading dock',
      status: 'resolved',
      created_at: '2026-10-21T18:00:00Z',
    },
  ]);

  const handleResolve = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
    success('Report marked as investigated & resolved.');
  };

  const handleSuspend = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    success('Listing suspended from public browsing.');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Admin Authorization Required</h2>
        <p className="text-xs text-stone-600">
          This portal is strictly restricted to platform moderators and trusted operations administrators.
          Switch your demo role to <strong>Operations Admin</strong> using the top menu to evaluate.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          <h1 className="text-2xl font-black text-stone-900">Safety & Moderation Oversight</h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Review community reports, verify food hygiene guidelines, and oversee active rescue transactions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Open Moderation Reports</h3>
          <span className="text-xs font-semibold text-stone-500">
            {reports.filter((r) => r.status !== 'resolved').length} pending review
          </span>
        </div>

        <div className="divide-y divide-warm-100">
          {reports.map((report) => (
            <div key={report.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{report.donation_title}</span>
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <p className="text-stone-600">
                  <strong className="text-stone-700">Reason:</strong> {report.reason}
                </p>
                <p className="text-[11px] text-stone-400">Reported by: {report.reporter_name}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {report.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleSuspend(report.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                >
                  Suspend Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
