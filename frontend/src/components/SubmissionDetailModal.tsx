import React, { useEffect } from 'react';
import { ContactSubmission } from '../types';
import {
  X,
  Mail,
  Phone,
  GraduationCap,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: ContactSubmission | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose
}) => {
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const copyToClipboard = (text: string, type: 'id' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {submission.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{submission.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>ID: {submission._id}</span>
                <button
                  onClick={() => copyToClipboard(submission._id, 'id')}
                  className="hover:text-indigo-400 transition"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center text-xs text-slate-400 mb-1">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  <span>Email Address</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                  <span className="truncate mr-2">{submission.email}</span>
                  <button
                    onClick={() => copyToClipboard(submission.email, 'email')}
                    className="text-slate-400 hover:text-indigo-400"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center text-xs text-slate-400 mb-1">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  <span>Phone Number</span>
                </div>
                <p className="text-sm font-medium text-slate-200 font-mono">
                  {submission.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Academic / Student Affiliation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Affiliation & Program Info
            </h3>
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Brototype Student Status</span>
                {submission.isBrototypeStudent === 'yes' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    Yes, Registered Student
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
                    No, Prospective Candidate
                  </span>
                )}
              </div>

              {submission.isBrototypeStudent === 'yes' && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
                  <div>
                    <span className="text-xs text-slate-500">Batch Number</span>
                    <p className="text-sm font-semibold text-slate-200 font-mono">
                      {submission.batchNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Counsellor Name</span>
                    <p className="text-sm font-semibold text-slate-200">
                      {submission.counsellorName || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Message */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Inquiry / Message
            </h3>
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {submission.message || (
                    <span className="text-slate-500 italic">No message provided with submission.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sync & Metadata Status */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              System Sync Status
            </h3>
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Google Sheets Sync Status:</span>
                <div>
                  {submission.sheetSyncStatus === 'synced' && (
                    <span className="inline-flex items-center text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Synced Successfully
                    </span>
                  )}
                  {submission.sheetSyncStatus === 'pending' && (
                    <span className="inline-flex items-center text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Pending Worker Sync
                    </span>
                  )}
                  {submission.sheetSyncStatus === 'failed' && (
                    <span className="inline-flex items-center text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Sync Failed
                    </span>
                  )}
                </div>
              </div>

              {submission.sheetSyncedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Synced At:</span>
                  <span className="text-slate-300 font-mono">{formatDate(submission.sheetSyncedAt)}</span>
                </div>
              )}

              {submission.sheetSyncError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300">
                  <span className="font-semibold block mb-0.5">Error Detail:</span>
                  <span className="font-mono text-[11px]">{submission.sheetSyncError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-slate-500">Submitted Timestamp:</span>
                <span className="text-slate-400 font-mono">{formatDate(submission.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
