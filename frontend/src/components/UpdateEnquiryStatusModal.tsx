import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEnquiryStatus } from '../api/submissions';
import { ContactSubmission, EnquiryLifecycleStatus, UpdateEnquiryStatusPayload } from '../types';
import { ALL_ENQUIRY_STATUSES, getStatusConfig } from '../utils/statusUtils';
import {
  X,
  Calendar,
  Video,
  FileText,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface UpdateEnquiryStatusModalProps {
  submission: ContactSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: ContactSubmission) => void;
}

export const UpdateEnquiryStatusModal: React.FC<UpdateEnquiryStatusModalProps> = ({
  submission,
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  const currentStatus = (submission?.status || 'ENQUIRED') as EnquiryLifecycleStatus;

  const [selectedTargetStatus, setSelectedTargetStatus] = useState<EnquiryLifecycleStatus | ''>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [meetLink, setMeetLink] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form whenever modal opens or submission changes
  useEffect(() => {
    if (submission && isOpen) {
      setSelectedTargetStatus(currentStatus);

      if (submission.scheduledAt) {
        const d = new Date(submission.scheduledAt);
        const isoString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setScheduledAt(isoString);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const isoTomorrow = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setScheduledAt(isoTomorrow);
      }

      setMeetLink(submission.meetLink || '');
      setFeedback(submission.feedback || '');
      setNotes('');
      setErrorMessage(null);
    }
  }, [submission, isOpen, currentStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateEnquiryStatusPayload) => {
      if (!submission) throw new Error('No submission selected');
      return updateEnquiryStatus(submission._id, payload);
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission', submission?._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      if (onSuccess) onSuccess(updatedData);
      onClose();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to update enquiry status. Please verify your inputs.';
      if (axios.isAxiosError<{ message?: string }>(err)) {
        msg = err.response?.data?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    }
  });

  if (!isOpen || !submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedTargetStatus) {
      setErrorMessage('Please select a status.');
      return;
    }

    if (selectedTargetStatus === currentStatus) {
      setErrorMessage(`Enquiry is already in "${getStatusConfig(currentStatus).label}" status. Please select a different status.`);
      return;
    }

    if (selectedTargetStatus === 'SCHEDULED' && !scheduledAt) {
      setErrorMessage('Please select a date and time for the session.');
      return;
    }

    if ((selectedTargetStatus === 'SELECTED' || selectedTargetStatus === 'REJECTED') && !feedback.trim()) {
      setErrorMessage(`Feedback is required when changing status to ${selectedTargetStatus}.`);
      return;
    }

    const payload: UpdateEnquiryStatusPayload = {
      status: selectedTargetStatus,
      adminOverride: true
    };

    if (selectedTargetStatus === 'SCHEDULED') {
      payload.scheduledAt = new Date(scheduledAt).toISOString();
      if (meetLink.trim()) payload.meetLink = meetLink.trim();
    }

    if (feedback.trim()) {
      payload.feedback = feedback.trim();
    }

    if (notes.trim()) {
      payload.notes = notes.trim();
    }

    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Change Status</h2>
            <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-1.5">
              <span>Candidate: <span className="text-zinc-200 font-medium">{submission.name}</span></span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Current:</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusConfig(currentStatus).badgeClass}`}>
                <span className={`w-1 h-1 rounded-full ${getStatusConfig(currentStatus).dotClass}`} />
                <span>{getStatusConfig(currentStatus).label}</span>
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Status Selection Dropdown - Show all enquiry statuses */}
          <div>
            <label htmlFor="target-status-select" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Select Status <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="target-status-select"
                value={selectedTargetStatus}
                onChange={(e) => {
                  setSelectedTargetStatus(e.target.value as EnquiryLifecycleStatus);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition cursor-pointer appearance-none pr-9"
              >
                {ALL_ENQUIRY_STATUSES.map((target) => {
                  const cfg = getStatusConfig(target);
                  const isCurrent = target === currentStatus;
                  return (
                    <option key={target} value={target} className="bg-zinc-900 text-zinc-100 py-1">
                      {cfg.label} {isCurrent ? '(Current)' : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {selectedTargetStatus && (
              <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(selectedTargetStatus).dotClass}`} />
                <span>{getStatusConfig(selectedTargetStatus).description}</span>
              </p>
            )}
          </div>

          {/* Conditional: SCHEDULED (Date, Time, Meet Link) */}
          {selectedTargetStatus === 'SCHEDULED' && (
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Session Date & Time <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Meeting Link</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
                />
              </div>
            </div>
          )}

          {/* Conditional: SELECTED / REJECTED (Feedback Required) */}
          {(selectedTargetStatus === 'SELECTED' || selectedTargetStatus === 'REJECTED') && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-300 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Feedback <span className="text-red-400">*</span></span>
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  selectedTargetStatus === 'SELECTED'
                    ? 'Enter reason for selection...'
                    : 'Enter reason for rejection...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition resize-none"
              />
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>Note</span>
              <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add internal note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !selectedTargetStatus || selectedTargetStatus === currentStatus}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{mutation.isPending ? 'Updating...' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
