import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSubmissions } from '../api/submissions';
import { ContactSubmission } from '../types';
import { StatsCards } from '../components/StatsCards';
import { FilterBar } from '../components/FilterBar';
import { SubmissionsTable } from '../components/SubmissionsTable';
import { Pagination } from '../components/Pagination';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import { AlertCircle } from 'lucide-react';

export const EnquiriesPage: React.FC = () => {
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
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [
      'submissions',
      {
        page,
        limit,
        status: statusFilter,
        isBrototypeStudent: studentFilter,
        search: debouncedSearch
      }
    ],
    queryFn: () =>
      fetchSubmissions({
        page,
        limit,
        status: statusFilter,
        isBrototypeStudent: studentFilter,
        search: debouncedSearch
      }),
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true
  });

  const submissions = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const count = data?.count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Enquiries</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manage contact form submissions and Google Sheets replication.
        </p>
      </div>

      {/* Metrics Cards */}
      <StatsCards total={total} submissions={submissions} isLoading={isLoading} />

      {/* Filters */}
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

      {/* Error message */}
      {isError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{(error as any)?.response?.data?.message || (error as Error).message}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded text-xs font-medium transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <SubmissionsTable
        submissions={submissions}
        isLoading={isLoading}
        onSelectSubmission={setSelectedSubmission}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        count={count}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};
