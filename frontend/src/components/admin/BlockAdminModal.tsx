import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBlockAdmin } from '../../api/admins';
import { AdminUser } from '../../types';
import { ShieldAlert, ShieldCheck, Loader2, X } from 'lucide-react';

interface BlockAdminModalProps {
  admin: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BlockAdminModal: React.FC<BlockAdminModalProps> = ({
  admin,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && admin) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admin, onClose]);

  const isBlocked = !!admin?.isBlocked;
  const targetBlockedStatus = !isBlocked;

  const mutation = useMutation({
    mutationFn: () => toggleBlockAdmin(admin?.id || admin?._id || '', targetBlockedStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      if (onSuccess) onSuccess();
      onClose();
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
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isBlocked
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                }`}
            >
              {isBlocked ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {isBlocked ? 'Unblock Administrator' : 'Block Administrator'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {isBlocked ? (
                <>
                  Are you sure you want to restore access for{' '}
                  <span className="font-semibold text-zinc-200">{admin.name}</span> ?
                </>
              ) : (
                <>
                  Are you sure you want to block{' '}
                  <span className="font-semibold text-zinc-200">{admin.name}</span> ?
                </>
              )}
            </p>
          </div>

          {mutation.isError && (
            <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs">
              {axios.isAxiosError<{ message?: string }>(mutation.error)
                ? mutation.error.response?.data?.message || mutation.error.message
                : 'Failed to update administrator status.'}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${isBlocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {mutation.isPending
                  ? isBlocked
                    ? 'Unblocking...'
                    : 'Blocking...'
                  : isBlocked
                    ? 'Unblock Admin'
                    : 'Block Admin'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

