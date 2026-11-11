import React from 'react';
import { ContactSubmission } from '../types';
import { getStatusConfig } from '../utils/statusUtils';
import { Inbox, Calendar, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SubmissionsTableProps {
  submissions: ContactSubmission[];
  isLoading: boolean;
  onSelectSubmission: (submission: ContactSubmission) => void;
  onUpdateStatus?: (submission: ContactSubmission) => void;
  sort?: string;
  onSortChange?: (newSort: string) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  isLoading,
  onSelectSubmission,
  onUpdateStatus,
  sort,
  onSortChange
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

  const handleNameSort = () => {
    if (!onSortChange) return;
    onSortChange(sort === 'name' ? '-name' : 'name');
  };

  const handleDateSort = () => {
    if (!onSortChange) return;
    onSortChange(sort === '-createdAt' ? 'createdAt' : '-createdAt');
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
              <div className="h-6 bg-zinc-800 rounded w-8"></div>
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
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
            <tr>
              {/* Name (Sortable) */}
              <th
                onClick={handleNameSort}
                className="py-3 px-4 cursor-pointer select-none hover:text-zinc-200 transition group"
                title="Sort by Name"
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sort === 'name' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-zinc-100" />
                  ) : sort === '-name' ? (
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-100" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
                  )}
                </div>
              </th>

              <th className="py-3 px-4">Phone no</th>
              <th className="py-3 px-4">Batch</th>

              {/* Submitted Date & Time (Sortable) */}
              <th
                onClick={handleDateSort}
                className="py-3 px-4 cursor-pointer select-none hover:text-zinc-200 transition group"
                title="Sort by Date & Time"
              >
                <div className="flex items-center space-x-1">
                  <span>Submitted Date</span>
                  {sort === '-createdAt' ? (
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-100" />
                  ) : sort === 'createdAt' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-zinc-100" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
                  )}
                </div>
              </th>

              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {submissions.map((sub) => {
              const cfg = getStatusConfig(sub.status);

              return (
                <tr
                  key={sub._id}
                  className="hover:bg-zinc-800/40 transition-colors duration-100"
                >
                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-zinc-100 whitespace-nowrap">
                    {sub.name}
                  </td>

                  {/* Phone no */}
                  <td className="py-3.5 px-4 text-zinc-300 font-mono text-xs whitespace-nowrap">
                    {sub.phone}
                  </td>

                  {/* Batch (if any) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {sub.batchNumber ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60">
                        {sub.batchNumber}
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-mono text-xs">—</span>
                    )}
                  </td>

                  {/* Submitted Date */}
                  <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                    {formatDate(sub.createdAt)}
                  </td>

                  {/* Status Badge (Click to Change Status) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      {onUpdateStatus ? (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(sub)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition hover:opacity-80 cursor-pointer ${cfg.badgeClass}`}
                          title="Click to change status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          <span>{cfg.label}</span>
                        </button>
                      ) : (
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          <span>{cfg.label}</span>
                        </span>
                      )}

                      {sub.status === 'SCHEDULED' && sub.scheduledAt && (
                        <div className="text-[10px] text-purple-300 font-mono flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span>{formatDate(sub.scheduledAt)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* View Details Only */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectSubmission(sub)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer inline-flex items-center justify-center border border-zinc-700/40"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
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
