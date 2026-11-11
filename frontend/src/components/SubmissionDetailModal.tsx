import React, { useEffect } from 'react';
import { ContactSubmission } from '../types';
import { getStatusConfig } from '../utils/statusUtils';
import {
  X,
  Calendar,
  Video,
  ExternalLink,
  Edit3
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: ContactSubmission | null;
  onClose: () => void;
  onUpdateStatus?: (submission: ContactSubmission) => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose,
  onUpdateStatus
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const currentStatus = submission.status || 'ENQUIRED';
  const statusCfg = getStatusConfig(currentStatus);
  const isStudent = submission.isBrototypeStudent === 'yes';

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  // Build full history including initial enquiry event if not present
  const getFullHistory = () => {
    const list = [...(submission.statusHistory || [])];
    if (list.length === 0) {
      list.push({
        status: submission.status || 'ENQUIRED',
        previousStatus: null,
        changedByName: 'Candidate (Form Submission)',
        changedAt: submission.createdAt,
        notes: submission.message || 'Initial contact enquiry submitted'
      });
    }
    // Reverse chronological order (latest status on top)
    return list.reverse();
  };

  const historyList = getFullHistory();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-zinc-100">{submission.name}</h2>
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
              <span>{statusCfg.label}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(submission)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg transition shadow-sm cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Status</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Phone Number</span>
              <span className="font-mono text-zinc-200">{submission.phone}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Email</span>
              <span className="text-zinc-200 truncate block" title={submission.email}>
                {submission.email}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Applicant Type</span>
              <span className="text-zinc-200 font-medium">
                {isStudent ? 'Brototype Student' : 'General'}
              </span>
            </div>
            {isStudent && submission.batchNumber && (
              <div>
                <span className="text-zinc-500 block text-[11px] mb-0.5">Batch</span>
                <span className="font-mono text-zinc-200">{submission.batchNumber}</span>
              </div>
            )}
            {submission.domain && (
              <div>
                <span className="text-zinc-500 block text-[11px] mb-0.5">Domain</span>
                <span className="text-zinc-200">{submission.domain}</span>
              </div>
            )}
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Submitted Date</span>
              <span className="font-mono text-zinc-300">{formatDateTime(submission.createdAt)}</span>
            </div>
          </div>

          {/* Active Schedule Session (if scheduled) */}
          {submission.scheduledAt && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-300 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Scheduled Session</span>
                </span>
                <span className="font-mono text-xs text-purple-300 font-medium">
                  {formatDateTime(submission.scheduledAt)}
                </span>
              </div>
              {submission.meetLink && (
                <div className="flex items-center space-x-2 pt-1 border-t border-purple-500/20 text-xs">
                  <Video className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="text-zinc-400">Meeting:</span>
                  <a
                    href={submission.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-100 underline truncate inline-flex items-center space-x-1"
                  >
                    <span className="truncate max-w-sm">{submission.meetLink}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Decision Feedback (if provided) */}
          {submission.feedback && (
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              currentStatus === 'SELECTED' || currentStatus === 'ONBOARDED'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                : currentStatus === 'REJECTED'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Evaluation Feedback
              </span>
              <p className="leading-relaxed whitespace-pre-wrap text-xs text-zinc-200">
                {submission.feedback}
              </p>
            </div>
          )}

          {/* Candidate Message (if provided) */}
          {submission.message && (
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-500 block text-[11px]">Message</span>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {submission.message}
              </p>
            </div>
          )}

          {/* Enquiry History — Visual Timeline */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-xs font-semibold text-zinc-200">Enquiry History</h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
              {historyList.map((item, index) => {
                const cfg = getStatusConfig(item.status);
                const message = item.feedback || item.notes;

                return (
                  <div key={item._id || index} className="relative">
                    {/* Timeline node circle on vertical line */}
                    <span className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-zinc-900 ${cfg.dotClass}`} />

                    <div className="space-y-1">
                      {/* Status & Time */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.badgeClass}`}>
                          <span>{cfg.label}</span>
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formatDateTime(item.changedAt)}
                        </span>
                      </div>

                      {/* Updated by */}
                      <div className="text-[11px] text-zinc-400">
                        Updated by <span className="text-zinc-200 font-medium">{item.changedByName || 'Admin'}</span>
                      </div>

                      {/* Scheduled info if applicable */}
                      {item.scheduledAt && (
                        <div className="text-[11px] text-purple-300 flex items-center space-x-1.5 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span>Scheduled: {formatDateTime(item.scheduledAt)}</span>
                          {item.meetLink && (
                            <a
                              href={item.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:underline ml-1 inline-flex items-center space-x-0.5"
                            >
                              <span>Meet Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Message / Feedback */}
                      {message && (
                        <p className="mt-1 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="px-6 py-3 bg-zinc-950/80 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
