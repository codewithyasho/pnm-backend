import React from 'react';
import { Users, Clock, CheckCircle2, Building2, TrendingUp } from 'lucide-react';
import type { EnquiryStatus } from '../types';

interface StatsCardsProps {
  total: number;
  pending: number;
  completed: number;
  companiesCount: number;
  onFilterStatus: (status: EnquiryStatus | null) => void;
  activeStatusFilter: EnquiryStatus | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  total,
  pending,
  completed,
  companiesCount,
  onFilterStatus,
  activeStatusFilter,
}) => {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Total Card */}
      <div
        onClick={() => onFilterStatus(null)}
        className={`cursor-pointer group p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${
          activeStatusFilter === null
            ? 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Leads
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {total}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span>All registered queries</span>
        </div>
      </div>

      {/* Pending Card */}
      <div
        onClick={() => onFilterStatus('pending')}
        className={`cursor-pointer group p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${
          activeStatusFilter === 'pending'
            ? 'ring-2 ring-amber-500 border-amber-300 bg-amber-50/40'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pending Action
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
          {pending}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>Awaiting HR response</span>
        </div>
      </div>

      {/* Completed Card */}
      <div
        onClick={() => onFilterStatus('completed')}
        className={`cursor-pointer group p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${
          activeStatusFilter === 'completed'
            ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/40'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Completed
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
          {completed}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>Successfully handled</span>
        </div>
      </div>

      {/* Corporate Clients Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Companies
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {companiesCount}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>Unique corporate orgs</span>
        </div>
      </div>

      {/* Resolution Rate Card */}
      <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resolution Rate
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight">
          {completionRate}%
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
