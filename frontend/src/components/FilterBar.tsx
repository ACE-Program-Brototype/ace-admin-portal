import React from 'react';
import { Search, RotateCw, X, Calendar } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  studentFilter: string;
  onStudentFilterChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  studentFilter,
  onStudentFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onRefresh,
  isFetching,
  onReset,
  hasActiveFilters
}) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 mb-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, or batch..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group: Status, General/Brototype, Date Range (startDate & endDate) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ENQUIRED">Enquired</option>
            <option value="CONNECTED">Connected</option>
            <option value="PREPARATION">Preparation</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="ONBOARDED">Onboarded</option>
          </select>

          {/* General and Brototype Filter */}
          <select
            value={studentFilter}
            onChange={(e) => onStudentFilterChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">All Applicants</option>
            <option value="yes">Brototype</option>
            <option value="no">General</option>
          </select>

          {/* Date Range: startDate and endDate */}
          <div className="inline-flex items-center space-x-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              title="Start Date"
              aria-label="Start Date"
              className="bg-transparent text-zinc-300 text-xs focus:outline-none [color-scheme:dark] cursor-pointer"
            />
            <span className="text-zinc-600 text-xs select-none">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              title="End Date"
              aria-label="End Date"
              className="bg-transparent text-zinc-300 text-xs focus:outline-none [color-scheme:dark] cursor-pointer"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  onStartDateChange('');
                  onEndDateChange('');
                }}
                className="text-zinc-500 hover:text-zinc-300 ml-1"
                title="Clear date range"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition cursor-pointer"
            >
              Reset
            </button>
          )}

          {/* Refresh Action */}
          <button
            type="button"
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
