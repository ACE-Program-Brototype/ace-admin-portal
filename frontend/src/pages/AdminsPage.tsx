import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdmins } from '../api/admins';
import { AdminUser } from '../types';
import {
  AdminFilterBar,
  AdminsTable,
  AddAdminModal,
  EditAdminModal,
  AdminDetailModal,
  BlockAdminModal,
  DeleteAdminModal
} from '../components/admin';
import { Pagination } from '../components/Pagination';
import { AlertCircle, UserPlus } from 'lucide-react';

export const AdminsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('-createdAt');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [adminToView, setAdminToView] = useState<AdminUser | null>(null);
  const [adminToEdit, setAdminToEdit] = useState<AdminUser | null>(null);
  const [adminToToggleBlock, setAdminToToggleBlock] = useState<AdminUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    setSort('-createdAt');
    setPage(1);
  };

  const hasActiveFilters = debouncedSearch.trim() !== '' || sort !== '-createdAt';

  // Server-side paginated query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'admins',
      {
        page,
        limit,
        search: debouncedSearch,
        sort
      }
    ],
    queryFn: () =>
      fetchAdmins({
        page,
        limit,
        search: debouncedSearch,
        sort
      }),
    staleTime: 1000 * 20,
    refetchOnWindowFocus: true
  });

  const admins = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const count = data?.count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Error state */}
      {isError && (
        <div className="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              {(error as any)?.response?.data?.message || 'Failed to load administrators. Please try again.'}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Sort Filter on the left, Separate Add Admin Button on the right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={handleSortChange}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Separated Add Admin Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-zinc-950" />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Admins Table with Eye View, Edit, Block/Unblock, and Delete Actions */}
      <AdminsTable
        admins={admins}
        isLoading={isLoading}
        onViewAdmin={(admin) => setAdminToView(admin)}
        onEditAdmin={(admin) => setAdminToEdit(admin)}
        onToggleBlockAdmin={(admin) => setAdminToToggleBlock(admin)}
        onDeleteAdmin={(admin) => setAdminToDelete(admin)}
      />

      {/* Server-side Pagination with Limit Dropdown ("Rows per page") */}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        count={count}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {/* Add Admin Modal (with Password & Confirm Password) */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Admin Modal (with optional Password & Confirm Password update) */}
      <EditAdminModal
        admin={adminToEdit}
        onClose={() => setAdminToEdit(null)}
        onSuccess={() => refetch()}
      />

      {/* Admin Details Modal (Triggered by Eye icon) */}
      <AdminDetailModal
        admin={adminToView}
        onClose={() => setAdminToView(null)}
        onEdit={(admin) => setAdminToEdit(admin)}
      />

      {/* Block / Unblock Confirmation Modal */}
      <BlockAdminModal
        admin={adminToToggleBlock}
        onClose={() => setAdminToToggleBlock(null)}
        onSuccess={() => refetch()}
      />

      {/* Delete Admin Confirmation Modal */}
      <DeleteAdminModal
        admin={adminToDelete}
        onClose={() => setAdminToDelete(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
