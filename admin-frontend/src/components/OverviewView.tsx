import React from 'react';
import type {
  UserEnquiry,
  EnquiryStatus,
} from '../types';
import {
  Building2,
  Clock,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Sparkles,
  Server,
} from 'lucide-react';

interface OverviewViewProps {
  enquiries: UserEnquiry[];
  companies: string[];
  onNavigateToTab: (tab: 'enquiries' | 'companies' | 'contacts') => void;
  onSelectEnquiry: (enquiry: UserEnquiry) => void;
  onUpdateStatus: (id: number, newStatus: EnquiryStatus) => Promise<void>;
  updatingId: number | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  enquiries,
  companies,
  onNavigateToTab,
  onSelectEnquiry,
  onUpdateStatus,
  updatingId,
}) => {
  const pendingEnquiries = enquiries.filter((e) => e.status.toLowerCase() === 'pending');
  const completedEnquiries = enquiries.filter((e) => e.status.toLowerCase() === 'completed');

  // Breakdown by primary interest
  const interestCounts: Record<string, number> = {};
  enquiries.forEach((e) => {
    const interest = e.primary_interest || 'Unspecified';
    interestCounts[interest] = (interestCounts[interest] || 0) + 1;
  });

  const sortedInterests = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>People Network Management LLP • Executive Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Lead & Client Management
          </h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Monitor real-time client consultations, corporate recruitment inquiries, and staffing requisitions. Update enquiry progression with instant database synchronization.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('enquiries')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <span>Manage Client Enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab('companies')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all border border-white/15"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Browse {companies.length} Companies</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Two Column Grid: Pending Queue & Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Enquiries Action Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pending Action Queue</h3>
                  <p className="text-xs text-slate-400">Leads awaiting specialist follow-up</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {pendingEnquiries.length} Pending
              </span>
            </div>

            {pendingEnquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="font-medium text-slate-700">All enquiries are up to date!</span>
                <p className="mt-1">There are no pending enquiries awaiting follow-up.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEnquiries.slice(0, 4).map((enquiry) => (
                  <div
                    key={enquiry.id}
                    onClick={() => onSelectEnquiry(enquiry)}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm capitalize group-hover:text-indigo-600">
                          {enquiry.full_name}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">• {enquiry.company_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="text-indigo-600 font-medium">{enquiry.primary_interest || 'Inquiry'}</span>
                        {enquiry.specific_requirements && (
                          <span className="text-slate-400 truncate max-w-xs inline-block align-bottom ml-2">
                            "{enquiry.specific_requirements}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onUpdateStatus(enquiry.id, 'completed')}
                        disabled={updatingId === enquiry.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                      >
                        {updatingId === enquiry.id ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total processed so far: {completedEnquiries.length}</span>
            <button
              onClick={() => onNavigateToTab('enquiries')}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View all enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Primary Interest Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Service Interest</h3>
                <p className="text-xs text-slate-400">Demand distribution</p>
              </div>
            </div>

            {sortedInterests.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No interest data yet</div>
            ) : (
              <div className="space-y-3">
                {sortedInterests.map(([interest, count]) => {
                  const percent = Math.round((count / (enquiries.length || 1)) * 100);
                  return (
                    <div key={interest} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 capitalize">{interest}</span>
                        <span className="text-slate-500 font-mono">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick API status card */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>FastAPI Architecture</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-tight">
              Backed by SQLite DB with live API endpoints for listing users, companies, contacts, and updating status via PATCH.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
