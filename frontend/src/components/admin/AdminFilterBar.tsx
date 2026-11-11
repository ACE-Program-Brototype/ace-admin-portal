import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onReset,
  hasActiveFilters
}) => {
  return (
    <div className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search across name, email, phone, role */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort and Reset */}
        <div className="flex items-center gap-2 text-xs">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
            <option value="role">Role (A-Z)</option>
            <option value="-role">Role (Z-A)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700/80 rounded-lg transition cursor-pointer"
              title="Reset search and sort"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
