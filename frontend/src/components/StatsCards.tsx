import React from 'react';
import { ContactSubmission } from '../types';
import { Users, GraduationCap, UserCheck, CheckCircle2, Clock } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  submissions: ContactSubmission[];
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, submissions, isLoading }) => {
  const brototypeCount = submissions.filter((s) => s.isBrototypeStudent === 'yes').length;
  const nonBrototypeCount = submissions.filter((s) => s.isBrototypeStudent === 'no').length;
  const syncedCount = submissions.filter((s) => s.sheetSyncStatus === 'synced').length;
  const pendingOrFailedCount = submissions.filter(
    (s) => s.sheetSyncStatus === 'pending' || s.sheetSyncStatus === 'failed'
  ).length;

  const stats = [
    {
      title: 'Total Inquiries',
      value: total,
      subtext: 'All recorded submissions',
      icon: Users,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Brototype Students',
      value: brototypeCount,
      subtext: 'Verified batch candidates',
      icon: GraduationCap,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      title: 'General Applicants',
      value: nonBrototypeCount,
      subtext: 'Prospective students',
      icon: UserCheck,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Sheets Synchronized',
      value: syncedCount,
      subtext: 'Exported to Google Sheet',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Pending Sync',
      value: pendingOrFailedCount,
      subtext: 'Awaiting sync dispatch',
      icon: Clock,
      iconColor: pendingOrFailedCount > 0 ? 'text-amber-400' : 'text-slate-400',
      iconBg: pendingOrFailedCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800 border-slate-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${stat.iconBg}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {isLoading ? (
                  <div className="h-7 w-12 bg-slate-800 animate-pulse rounded"></div>
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{stat.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

