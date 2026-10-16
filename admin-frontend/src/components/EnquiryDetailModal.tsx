import React, { useState } from 'react';
import type {
  UserEnquiry,
  EnquiryStatus,
} from '../types';
import {
  X,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  Copy,
  MessageSquare,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface EnquiryDetailModalProps {
  enquiry: UserEnquiry | null;
  onClose: () => void;
  onUpdateStatus: (id: number, newStatus: EnquiryStatus) => Promise<void>;
  isUpdating: boolean;
  onCopyText: (text: string, label: string) => void;
  onDeleteUser: (id: number) => Promise<void>;
  isDeleting: boolean;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiry,
  onClose,
  onUpdateStatus,
  isUpdating,
  onCopyText,
  onDeleteUser,
  isDeleting,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (!enquiry) return null;

  const isPending = enquiry.status.toLowerCase() === 'pending';

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-200">
                  ID #{enquiry.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isPending
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-emerald-400 text-emerald-950'
                  }`}
                >
                  {isPending ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  <span className="capitalize">{enquiry.status}</span>
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight capitalize">
                {enquiry.full_name}
              </h3>
              <p className="text-xs text-indigo-200 flex items-center gap-1.5 mt-1 capitalize">
                <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>{enquiry.company_name}</span>
                {enquiry.employee_count && <span>• {enquiry.employee_count} employees</span>}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Corporate Email
                  </div>
                  <div className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {enquiry.corporate_email}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onCopyText(enquiry.corporate_email, 'Email')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                    title="Copy email address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`mailto:${enquiry.corporate_email}`}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Open mail client"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono mt-0.5">
                    {enquiry.phone_number}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onCopyText(enquiry.phone_number, 'Phone')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                    title="Copy phone number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`tel:${enquiry.phone_number}`}
                    className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Direct call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Service Interest */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Primary Interest
                </div>
                <div className="text-sm font-semibold text-indigo-700 mt-0.5">
                  {enquiry.primary_interest || 'General HR Advisory'}
                </div>
              </div>

              {/* Submission Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Submission Date
                </div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">
                  {formatDate(enquiry.created_at)}
                </div>
              </div>
            </div>

            {/* Specific Requirements Note */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Specific Requirements / Client Note</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {enquiry.specific_requirements ? (
                  enquiry.specific_requirements
                ) : (
                  <span className="text-slate-400 italic">No additional requirements specified by the user.</span>
                )}
              </div>
            </div>

            {/* Status change actions panel */}
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">Enquiry Status Management</div>
                <div className="text-xs text-slate-500">
                  Current: <span className="font-semibold capitalize text-slate-800">{enquiry.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onUpdateStatus(enquiry.id, isPending ? 'completed' : 'pending')}
                  disabled={isUpdating}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 ${
                    isPending
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {isUpdating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPending ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>{isPending ? 'Mark as Completed' : 'Revert to Pending'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {showDeleteConfirm ? (
              <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Permanently delete this enquiry?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await onDeleteUser(enquiry.id);
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Delete this enquiry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Enquiry</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
