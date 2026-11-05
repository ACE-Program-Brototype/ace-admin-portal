import React from 'react';
import { ContactSubmission } from '../types';

interface StatsCardsProps {
  total: number;
  submissions: ContactSubmission[];
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, submissions, isLoading }) => {
  const brototypeCount = submissions.filter((s) => s.isBrototypeStudent === 'yes').length;
  const syncedCount = submissions.filter((s) => s.sheetSyncStatus === 'synced').length;
  const pendingCount = submissions.filter((s) => s.sheetSyncStatus === 'pending').length;

  const stats = [
    {
      label: 'Total Submissions',
      value: total,
      meta: 'All recorded inquiries'
    },
    {
      label: 'Brototype Students',
      value: brototypeCount,
      meta: 'Current page filtered'
    },
    {
      label: 'Google Sheets Synced',
      value: syncedCount,
      meta: 'Replicated to sheet'
    },
    {
      label: 'Pending Sync',
      value: pendingCount,
      meta: pendingCount > 0 ? 'Requires sync' : 'Up to date'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-zinc-100 tracking-tight">
              {isLoading ? (
                <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded"></div>
              ) : (
                stat.value
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{stat.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
