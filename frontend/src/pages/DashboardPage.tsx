import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSubmissions } from '../api/submissions';
import { ContactSubmission } from '../types';
import { Navbar } from '../components/Navbar';
import { StatsCards } from '../components/StatsCards';
import { FilterBar } from '../components/FilterBar';
import { SubmissionsTable } from '../components/SubmissionsTable';
import { Pagination } from '../components/Pagination';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import { AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters change
  const handleStudentFilterChange = (val: string) => {
    setStudentFilter(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStudentFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' || studentFilter !== 'all' || statusFilter !== 'all';

  // TanStack Query for submissions caching and background sync
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['submissions', { page, limit, status: statusFilter, isBrototypeStudent: studentFilter, search: debouncedSearch }],
    queryFn: () =>
      fetchSubmissions({
        page,
        limit,
        status: statusFilter,
        isBrototypeStudent: studentFilter,
        search: debouncedSearch
      }),
    staleTime: 1000 * 15, // 15 seconds
    refetchOnWindowFocus: true
  });

  const submissions = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const count = data?.count || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Form Submissions Console</h1>
            <p className="text-xs text-slate-400">
              Real-time candidate submissions with MongoDB persistence & Google Sheets replication
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Data Feed</span>
          </div>
        </div>

        {/* High level metrics */}
        <StatsCards total={total} submissions={submissions} isLoading={isLoading} />

        {/* Filters and controls */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          studentFilter={studentFilter}
          onStudentFilterChange={handleStudentFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          limit={limit}
          onLimitChange={handleLimitChange}
          onRefresh={refetch}
          isFetching={isFetching}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Error state */}
        {isError && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                Failed to load submissions: {(error as any)?.response?.data?.message || (error as Error).message}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Submissions table */}
        <SubmissionsTable
          submissions={submissions}
          isLoading={isLoading}
          onSelectSubmission={setSelectedSubmission}
        />

        {/* Pagination bar */}
        <Pagination
          page={page}
          pages={pages}
          total={total}
          count={count}
          limit={limit}
          onPageChange={setPage}
        />
      </main>

      {/* Details Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

