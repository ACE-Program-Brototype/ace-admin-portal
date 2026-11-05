import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  count: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pages,
  total,
  limit,
  onPageChange
}) => {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers
  const getPageNumbers = () => {
    const list: (number | string)[] = [];
    const maxVisible = 5;

    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) list.push(i);
    } else {
      list.push(1);
      if (page > 3) list.push('...');
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(pages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        list.push(i);
      }

      if (page < pages - 2) list.push('...');
      list.push(pages);
    }

    return list;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1 py-2 text-xs text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-200">{start}</span> to{' '}
        <span className="font-semibold text-slate-200">{end}</span> of{' '}
        <span className="font-semibold text-slate-200">{total}</span> submissions
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={idx} className="px-2 py-1 text-slate-600">
                ...
              </span>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={idx}
              onClick={() => onPageChange(Number(p))}
              className={`min-w-[32px] h-8 px-2 rounded-lg font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

