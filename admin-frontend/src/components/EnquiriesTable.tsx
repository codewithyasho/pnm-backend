import React, { useState } from 'react';
import type {
  UserEnquiry,
  EnquiryStatus,
} from '../types';
import {
  Mail,
  Phone,
  Building2,
  Users2,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface EnquiriesTableProps {
  enquiries: UserEnquiry[];
  isLoading: boolean;
  onSelectEnquiry: (enquiry: UserEnquiry) => void;
  onUpdateStatus: (id: number, newStatus: EnquiryStatus) => Promise<void>;
  updatingId: number | null;
  onCopyText: (text: string, label: string) => void;
  onDeleteUser: (id: number) => Promise<void>;
  deletingId: number | null;
  highlightedId?: number | null;
}

export const EnquiriesTable: React.FC<EnquiriesTableProps> = ({
  enquiries,
  isLoading,
  onSelectEnquiry,
  onUpdateStatus,
  updatingId,
  onCopyText,
  onDeleteUser,
  deletingId,
  highlightedId,
}) => {
  const [confirmDeleteEnquiry, setConfirmDeleteEnquiry] = useState<UserEnquiry | null>(null);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-28 animate-pulse" />
            </div>
            <div className="h-6 bg-slate-200 rounded-full w-24 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No Enquiries Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          No records match your selected filters or search terms. Try clearing filters or refreshing data.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header summary */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>Client Enquiries</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-bold">
              {enquiries.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">Click a record to view full requirement details</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Client / Candidate</th>
                <th className="py-3 px-4">Company & Size</th>
                <th className="py-3 px-4">Primary Interest</th>
                <th className="py-3 px-4">Specific Note</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {enquiries.map((enquiry) => {
                const isPending = enquiry.status.toLowerCase() === 'pending';
                const isUpdating = updatingId === enquiry.id;
                const isDeleting = deletingId === enquiry.id;
                const isHighlighted = highlightedId === enquiry.id;

                return (
                  <tr
                    key={enquiry.id}
                    className={`transition-all duration-500 group cursor-pointer ${
                      isHighlighted
                        ? 'bg-emerald-50/80 ring-2 ring-emerald-500/30'
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => onSelectEnquiry(enquiry)}
                  >
                    {/* Name and contact info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize flex items-center gap-2">
                        <span>{enquiry.full_name}</span>
                        {isHighlighted && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyText(enquiry.corporate_email, 'Email');
                          }}
                          className="hover:text-indigo-600 flex items-center gap-1 hover:underline"
                          title="Copy email"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{enquiry.corporate_email}</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyText(enquiry.phone_number, 'Phone');
                          }}
                          className="hover:text-indigo-600 flex items-center gap-1 hover:underline font-mono"
                          title="Copy phone"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{enquiry.phone_number}</span>
                        </button>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5 capitalize">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{enquiry.company_name}</span>
                      </div>
                      {enquiry.employee_count && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Users2 className="w-3 h-3 text-slate-400" />
                          <span>{enquiry.employee_count} employees</span>
                        </div>
                      )}
                    </td>

                    {/* Primary Interest */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {enquiry.primary_interest || 'General Inquiry'}
                      </span>
                    </td>

                    {/* Specific requirements preview */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 truncate" title={enquiry.specific_requirements || ''}>
                        {enquiry.specific_requirements || <span className="text-slate-300 italic">None</span>}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(enquiry.created_at)}</span>
                      </div>
                    </td>

                    {/* Status toggle badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          onUpdateStatus(enquiry.id, isPending ? 'completed' : 'pending')
                        }
                        disabled={isUpdating}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-50 ${
                          isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {isUpdating ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isPending ? (
                          <Clock className="w-3 h-3 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        <span className="capitalize">{enquiry.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`mailto:${enquiry.corporate_email}?subject=Regarding your enquiry with People Network Management`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${enquiry.phone_number}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => onSelectEnquiry(enquiry)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteEnquiry(enquiry)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete Enquiry"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (Optimized for phones & touch screens) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {enquiries.map((enquiry) => {
            const isPending = enquiry.status.toLowerCase() === 'pending';
            const isUpdating = updatingId === enquiry.id;
            const isDeleting = deletingId === enquiry.id;
            const isHighlighted = highlightedId === enquiry.id;

            return (
              <div
                key={enquiry.id}
                onClick={() => onSelectEnquiry(enquiry)}
                className={`p-4 transition-all duration-500 cursor-pointer space-y-3 ${
                  isHighlighted
                    ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40'
                    : 'hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {/* Top row: Name + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base capitalize">{enquiry.full_name}</h4>
                      {isHighlighted && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700 capitalize">{enquiry.company_name}</span>
                      {enquiry.employee_count && <span>• {enquiry.employee_count} emp</span>}
                    </div>
                  </div>

                  {/* Status Toggle Button on Mobile */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(enquiry.id, isPending ? 'completed' : 'pending');
                    }}
                    disabled={isUpdating}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      isPending
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isUpdating ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isPending ? (
                      <Clock className="w-3 h-3 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span className="capitalize">{enquiry.status}</span>
                  </button>
                </div>

                {/* Service Interest tag */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {enquiry.primary_interest || 'General'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(enquiry.created_at)}
                  </span>
                </div>

                {/* Specific requirements quote */}
                {enquiry.specific_requirements && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 line-clamp-2 italic">
                    "{enquiry.specific_requirements}"
                  </p>
                )}

                {/* Action buttons bar for phone */}
                <div
                  className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a
                      href={`mailto:${enquiry.corporate_email}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                    <a
                      href={`tel:${enquiry.phone_number}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => setConfirmDeleteEnquiry(enquiry)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200"
                      title="Delete Record"
                    >
                      {isDeleting ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectEnquiry(enquiry)}
                    className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline p-1"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog Modal for Deletion */}
      {confirmDeleteEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              if (deletingId === null) setConfirmDeleteEnquiry(null);
            }}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Client Enquiry</h3>
                  <p className="text-xs text-slate-500">Record ID #{confirmDeleteEnquiry.id}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the enquiry from{' '}
                <strong className="text-slate-900 font-semibold capitalize">{confirmDeleteEnquiry.full_name}</strong>{' '}
                ({confirmDeleteEnquiry.company_name})? This action will remove the record from the SQLite database and cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteEnquiry(null)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteUser(confirmDeleteEnquiry.id);
                    setConfirmDeleteEnquiry(null);
                  }}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {deletingId === confirmDeleteEnquiry.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
