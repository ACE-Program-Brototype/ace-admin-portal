import React from 'react';
import { ContactSubmission } from '../types';
import { Inbox } from 'lucide-react';

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

  const renderStatus = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
            Synced
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-xs font-medium text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden p-6">
        <div className="space-y-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/5"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/6"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/8"></div>
              <div className="h-6 bg-zinc-800 rounded w-14"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-zinc-200">No submissions found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          No inquiries matching the current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Affiliation</th>
              <th className="py-3 px-4">Google Sheet</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {submissions.map((sub) => {
              const isStudent = sub.isBrototypeStudent === 'yes';

              return (
                <tr
                  key={sub._id}
                  className="hover:bg-zinc-800/40 transition-colors duration-100"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-100">{sub.name}</div>
                    {sub.message && (
                      <div className="text-[11px] text-zinc-500 truncate max-w-[220px]" title={sub.message}>
                        {sub.message}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-zinc-300">
                    <div>{sub.email}</div>
                    <div className="text-zinc-500 text-[11px] font-mono mt-0.5">{sub.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    {isStudent ? (
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60">
                          Brototype Student
                        </span>
                        {sub.batchNumber && (
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            Batch: {sub.batchNumber}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">General</span>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderStatus(sub.sheetSyncStatus)}
                  </td>

                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {formatDate(sub.createdAt)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectSubmission(sub)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                    >
                      View
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
