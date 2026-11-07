import React, { useEffect, useState } from 'react';
import { ContactSubmission } from '../types';
import { X, Copy, Check } from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: ContactSubmission | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">{submission.name}</h2>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-mono mt-0.5">
              <span>{submission._id}</span>
              <button
                onClick={() => copy(submission._id, 'id')}
                className="text-zinc-500 hover:text-zinc-300"
                title="Copy ID"
              >
                {copied === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
            <div>
              <span className="text-zinc-500 block mb-0.5">Email</span>
              <div className="flex items-center space-x-1 font-medium text-zinc-200">
                <span className="truncate">{submission.email}</span>
                <button
                  onClick={() => copy(submission.email, 'email')}
                  className="text-zinc-500 hover:text-zinc-300"
                  title="Copy email"
                >
                  {copied === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Phone</span>
              <span className="font-mono text-zinc-200">{submission.phone}</span>
            </div>
          </div>

          {/* Student Status & Affiliation */}
          <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Affiliation</span>
              <span className="font-medium text-zinc-200">
                {submission.isBrototypeStudent === 'yes' ? 'Brototype Student' : 'General Inquiry'}
              </span>
            </div>
            {submission.isBrototypeStudent === 'yes' && (
              <>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <span className="text-zinc-500">Batch Number</span>
                  <span className="font-mono text-zinc-200">{submission.batchNumber || '—'}</span>
                </div>
                {submission.domain && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Domain</span>
                    <span className="text-zinc-200 font-medium">{submission.domain}</span>
                  </div>
                )}
                {submission.counsellorName && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Counsellor</span>
                    <span className="text-zinc-200">{submission.counsellorName}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Message */}
          <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
            <span className="text-zinc-500 block mb-1">Message</span>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {submission.message || <span className="text-zinc-600 italic">No message provided.</span>}
            </p>
          </div>

          {/* System & Sync */}
          <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Google Sheet Status</span>
              <span
                className={`font-medium ${
                  submission.sheetSyncStatus === 'synced'
                    ? 'text-emerald-400'
                    : submission.sheetSyncStatus === 'failed'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {submission.sheetSyncStatus.toUpperCase()}
              </span>
            </div>
            {submission.sheetSyncedAt && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Synced At</span>
                <span className="text-zinc-400 font-mono">{formatDate(submission.sheetSyncedAt)}</span>
              </div>
            )}
            {submission.sheetSyncError && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded font-mono text-[11px]">
                {submission.sheetSyncError}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-zinc-500">Submitted At</span>
              <span className="text-zinc-400 font-mono">{formatDate(submission.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950/80 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
