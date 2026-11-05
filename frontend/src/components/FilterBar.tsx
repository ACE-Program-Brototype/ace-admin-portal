import React from 'react';
import { Search, RotateCw, X } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  studentFilter: string;
  onStudentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
  isFetching: boolean;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  studentFilter,
  onStudentFilterChange,
  statusFilter,
  onStatusFilterChange,
  limit,
  onLimitChange,
  onRefresh,
  isFetching,
  onReset,
  hasActiveFilters
}) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or batch..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={studentFilter}
            onChange={(e) => onStudentFilterChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">Affiliation: All</option>
            <option value="yes">Brototype Students</option>
            <option value="no">General Applicants</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">Sheets: All</option>
            <option value="synced">Synced</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-lg transition"
            >
              Reset
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh submissions"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
