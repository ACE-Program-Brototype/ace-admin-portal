import React from 'react';
import { Search, RotateCw, X, Filter } from 'lucide-react';

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or batch..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Student Status */}
          <div className="relative">
            <select
              value={studentFilter}
              onChange={(e) => onStudentFilterChange(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Student: All</option>
              <option value="yes">Brototype Students</option>
              <option value="no">Non-Brototype</option>
            </select>
            <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sync Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Sync: All Statuses</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Limit / Page Size */}
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1 px-2.5 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh Data"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

