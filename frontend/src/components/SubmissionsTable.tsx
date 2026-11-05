import React from 'react';
import { ContactSubmission } from '../types';
import {
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Inbox
} from 'lucide-react';

interface SubmissionsTableProps {
  submissions: ContactSubmission[];
  isLoading: boolean;
  onSelectSubmission: (submission: ContactSubmission) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  isLoading,
  onSelectSubmission
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const renderSyncBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Synced
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3 w-1/4">
                <div className="w-9 h-9 rounded-full bg-slate-800"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-800 rounded w-1/6"></div>
              <div className="h-4 bg-slate-800 rounded w-1/6"></div>
              <div className="h-4 bg-slate-800 rounded w-1/8"></div>
              <div className="h-7 bg-slate-800 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No submissions found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          No contact inquiries matched your current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Candidate</th>
              <th className="py-3.5 px-4 font-semibold">Contact Info</th>
              <th className="py-3.5 px-4 font-semibold">Student Affiliation</th>
              <th className="py-3.5 px-4 font-semibold">Google Sheet</th>
              <th className="py-3.5 px-4 font-semibold">Submitted</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {submissions.map((sub) => {
              const isStudent = sub.isBrototypeStudent === 'yes';

              return (
                <tr
                  key={sub._id}
                  className="hover:bg-slate-800/30 transition-colors duration-150 group"
                >
                  {/* Candidate Name & Message Preview */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/20 text-indigo-300 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">{sub.name}</div>
                        {sub.message ? (
                          <div className="text-xs text-slate-400 max-w-[200px] truncate" title={sub.message}>
                            "{sub.message}"
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic">No message</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-3 px-4 text-xs space-y-1">
                    <div className="flex items-center text-slate-300">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{sub.email}</span>
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500 flex-shrink-0" />
                      <span>{sub.phone}</span>
                    </div>
                  </td>

                  {/* Student Affiliation */}
                  <td className="py-3 px-4">
                    {isStudent ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Brototype Student
                        </span>
                        {(sub.batchNumber || sub.counsellorName) && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            {sub.batchNumber && <span className="font-mono text-slate-300 mr-2">Batch: {sub.batchNumber}</span>}
                            {sub.counsellorName && <span>Counsellor: {sub.counsellorName}</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                        General Inquiry
                      </span>
                    )}
                  </td>

                  {/* Google Sheet Sync */}
                  <td className="py-3 px-4">
                    {renderSyncBadge(sub.sheetSyncStatus)}
                  </td>

                  {/* Submitted Date */}
                  <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(sub.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectSubmission(sub)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 hover:border-indigo-500 transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

