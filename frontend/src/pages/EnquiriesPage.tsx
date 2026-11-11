import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { fetchSubmissions } from '../api/submissions';
import { ContactSubmission } from '../types';
import { StatsCards } from '../components/StatsCards';
import { FilterBar } from '../components/FilterBar';
import { SubmissionsTable } from '../components/SubmissionsTable';
import { Pagination } from '../components/Pagination';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import { UpdateEnquiryStatusModal } from '../components/UpdateEnquiryStatusModal';
import { AlertCircle } from 'lucide-react';

export const EnquiriesPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sort, setSort] = useState<string>('-createdAt');

  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [enquiryForStatusUpdate, setEnquiryForStatusUpdate] = useState<ContactSubmission | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleStudentFilterChange = (val: string) => {
    setStudentFilter(val);
    setPage(1);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setPage(1);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setStudentFilter('all');
    setStartDate('');
    setEndDate('');
    setSort('-createdAt');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' ||
    statusFilter !== 'all' ||
    studentFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    sort !== '-createdAt';

  // Server-side paginated & filtered query
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
        startDate,
        endDate,
        sort,
        search: debouncedSearch
      }
    ],
    queryFn: () =>
      fetchSubmissions({
        page,
        limit,
        status: statusFilter,
        isBrototypeStudent: studentFilter,
        startDate,
        endDate,
        sort,
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
      {/* Metrics Cards */}
      <StatsCards total={total} submissions={submissions} isLoading={isLoading} />

      {/* Filters Bar: Status, General/Brototype, Date Range (startDate & endDate), Sort */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        studentFilter={studentFilter}
        onStudentFilterChange={handleStudentFilterChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
        sort={sort}
        onSortChange={handleSortChange}
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
            <span>
              {axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message || error.message
                : (error as Error).message}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded text-xs font-medium transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Clean Enquiry Listing Table: Name (Sortable), Phone no, Batch (if any), Submitted date (Sortable), Status, View icon */}
      <SubmissionsTable
        submissions={submissions}
        isLoading={isLoading}
        onSelectSubmission={setSelectedSubmission}
        onUpdateStatus={setEnquiryForStatusUpdate}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {/* Page selection & backend pagination at the bottom */}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        count={count}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {/* Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onUpdateStatus={(sub) => setEnquiryForStatusUpdate(sub)}
      />

      {/* Lifecycle Status Update Modal */}
      <UpdateEnquiryStatusModal
        submission={enquiryForStatusUpdate}
        isOpen={!!enquiryForStatusUpdate}
        onClose={() => setEnquiryForStatusUpdate(null)}
        onSuccess={(updated) => {
          if (selectedSubmission?._id === updated._id) {
            setSelectedSubmission(updated);
          }
          refetch();
        }}
      />
    </div>
  );
};
