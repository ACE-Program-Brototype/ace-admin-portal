import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, SlidersHorizontal, RotateCw } from 'lucide-react';

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Accounts' },
  { id: 'active', label: 'Active Only' },
  { id: 'blocked', label: 'Blocked Only' }
];

const SORT_OPTIONS = [
  { id: '-createdAt', label: 'Created (Newest First)' },
  { id: 'createdAt', label: 'Created (Oldest First)' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: '-name', label: 'Name (Z–A)' },
  { id: 'role', label: 'Role (A–Z)' },
  { id: '-role', label: 'Role (Z–A)' }
];

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange = () => {},
  sort,
  onSortChange,
  onRefresh,
  isFetching = false,
  onReset,
  hasActiveFilters
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Count active drawer filters
  const activeDrawerFiltersCount = [
    statusFilter !== 'all',
    sort !== '-createdAt'
  ].filter(Boolean).length;

  return (
    <>
      {/* Primary Bar: Search Bar + Equalizer Filter Icon Button + Refresh Button */}
      <div className="flex-1 flex items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter (Equalizer) Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`relative inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer select-none ${
            activeDrawerFiltersCount > 0
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-xs'
              : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
          }`}
          title="Filter and Sort administrators"
          aria-label="Open administrator filter and sort drawer"
        >
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Filters</span>
          {activeDrawerFiltersCount > 0 && (
            <span className="w-4.5 h-4.5 rounded-full text-[10px] font-bold bg-amber-400 text-zinc-950 flex items-center justify-center">
              {activeDrawerFiltersCount}
            </span>
          )}
        </button>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh administrators list"
            className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition disabled:opacity-50 cursor-pointer"
            aria-label="Refresh administrators"
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Side Drawer for All Administrator Filter & Sort Options */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-over Drawer Panel */}
            <div className="relative w-full max-w-sm sm:max-w-md bg-[#09090b] border-l border-zinc-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-200 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
                      <span>Admin Filters & Sort</span>
                      {activeDrawerFiltersCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                          {activeDrawerFiltersCount} active
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-zinc-400">Refine administrators by account status or sorting</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                  aria-label="Close filters drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* 1. Account Status */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                      Account Status
                    </label>
                    {statusFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => onStatusFilterChange('all')}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = statusFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onStatusFilterChange(opt.id)}
                          className={`py-2 px-2.5 rounded-lg border text-center text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-medium'
                              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sort Order */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                      Sort Administrators By
                    </label>
                    {sort !== '-createdAt' && (
                      <button
                        type="button"
                        onClick={() => onSortChange('-createdAt')}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                      >
                        Default
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sort === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onSortChange(opt.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-medium'
                              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onReset}
                  disabled={!hasActiveFilters}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-4 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-xl transition shadow-xs cursor-pointer text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
