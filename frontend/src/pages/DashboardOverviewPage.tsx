import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchSubmissions } from '../api/submissions';
import { ContactSubmission } from '../types';
import { StatsCards } from '../components/StatsCards';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import {
  Inbox,
  ArrowRight,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  // Fetch recent submissions (first 50 for analytics and recent activity)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () =>
      fetchSubmissions({
        page: 1,
        limit: 50
      }),
    staleTime: 1000 * 20
  });

  const submissions = data?.data || [];
  const total = data?.total || 0;
  const recentSubmissions = submissions.slice(0, 6);

  // Calculate domain breakdown for Brototype students
  const domainCounts = submissions.reduce((acc, curr) => {
    if (curr.isBrototypeStudent === 'yes' && curr.domain) {
      acc[curr.domain] = (acc[curr.domain] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const syncedCount = submissions.filter((s) => s.sheetSyncStatus === 'synced').length;
  const pendingCount = submissions.filter((s) => s.sheetSyncStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[11px] font-medium mb-2.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Welcome back, {user?.name || 'Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Monitor incoming student applications, Google Sheets synchronization, and domain preferences across the ACE community.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              to="/enquiries"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              <span>View All Enquiries</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div>
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Overview Metrics
        </h2>
        <StatsCards total={total} submissions={submissions} isLoading={isLoading} />
      </div>

      {/* Grid: Recent Submissions + Integration & Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Recent Enquiries</h3>
            </div>
            <Link
              to="/enquiries"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 inline-flex items-center space-x-1 transition"
            >
              <span>See all ({total})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60 flex-1">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-zinc-800/40 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No submissions recorded yet.</div>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => setSelectedSubmission(sub)}
                  className="p-3.5 hover:bg-zinc-800/40 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                        {sub.name}
                      </span>
                      {sub.isBrototypeStudent === 'yes' ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-medium">
                          Student
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium">
                          General
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                      {sub.email} • {sub.phone}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {sub.domain && (
                      <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-medium bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/40">
                        {sub.domain}
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        sub.sheetSyncStatus === 'synced'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {sub.sheetSyncStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: System Status & Top Domains */}
        <div className="space-y-6">
          {/* Integration Status Card */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Sync & Database Health
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">MongoDB Database</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Cluster 'ace' active</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Google Sheets Sync</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {syncedCount} synced {pendingCount > 0 && `• ${pendingCount} pending`}
                    </div>
                  </div>
                </div>
                {pendingCount === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Popular Student Domains */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Top Student Domains
            </h3>

            {sortedDomains.length === 0 ? (
              <div className="text-xs text-zinc-500 p-2">No domain submissions recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {sortedDomains.map(([dom, cnt]) => (
                  <div key={dom} className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-300 font-medium">{dom}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[11px] border border-zinc-700/40">
                      {cnt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

