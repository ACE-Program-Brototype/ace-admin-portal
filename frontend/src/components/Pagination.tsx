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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1 py-2 text-xs text-zinc-400">
      <div>
        Showing <span className="font-medium text-zinc-200">{start}</span>–
        <span className="font-medium text-zinc-200">{end}</span> of{' '}
        <span className="font-medium text-zinc-200">{total}</span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={idx} className="px-1.5 py-1 text-zinc-600">
                ...
              </span>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={idx}
              onClick={() => onPageChange(Number(p))}
              className={`min-w-[28px] h-7 px-1.5 rounded text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
