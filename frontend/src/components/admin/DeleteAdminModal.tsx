import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdmin } from '../../api/admins';
import { AdminUser } from '../../types';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteAdminModalProps {
  admin: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({
  admin,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [admin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && admin) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admin, onClose]);

  const mutation = useMutation({
    mutationFn: () => deleteAdmin(admin?.id || admin?._id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to delete administrator.';
      if (axios.isAxiosError<{ message?: string }>(err)) {
        msg = err.response?.data?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    }
  });

  if (!admin) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-1.5">
              <span>Delete Administrator</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-zinc-200">{admin.name}</span>{' '}
              <span className="text-zinc-400">({admin.email})</span>? This action cannot be undone.
            </p>
          </div>

          <div className="mt-3 flex items-center space-x-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Permanent deletion cannot be reversed.</span>
          </div>

          {errorMessage && (
            <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{mutation.isPending ? 'Deleting...' : 'Delete Admin'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
