import React, { useEffect, useState } from 'react';
import { AdminUser } from '../../types';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

interface AdminDetailModalProps {
  admin: AdminUser | null;
  onClose: () => void;
  onEdit?: (admin: AdminUser) => void;
}

export const AdminDetailModal: React.FC<AdminDetailModalProps> = ({
  admin,
  onClose,
  onEdit
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && admin) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admin, onClose]);

  if (!admin) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'AD';
  };

  const adminId = admin.id || admin._id || '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/70 text-zinc-200 flex items-center justify-center font-bold text-sm">
              {getInitials(admin.name, admin.email)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">{admin.name}</h2>
              <div className="flex items-center space-x-1 text-[11px] text-zinc-400 font-mono">
                <span>{adminId.slice(0, 10)}...</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(adminId, 'id')}
                  className="text-zinc-500 hover:text-zinc-300"
                  title="Copy full ID"
                >
                  {copiedField === 'id' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status and Access Tier */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            <div>
              <span className="text-zinc-500 block text-[11px] mb-1">Account Status</span>
              {admin.isBlocked ? (
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/25">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Blocked</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active</span>
                </span>
              )}
            </div>

            <div>
              <span className="text-zinc-500 block text-[11px] mb-1">Access Control</span>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Standard Admin</span>
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            {/* Email */}
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Email Address</span>
              <div className="flex items-center justify-between text-zinc-200 font-mono">
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(admin.email, 'email')}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Phone Number</span>
              <div className="flex items-center space-x-2 text-zinc-200 font-mono">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{admin.phone || 'Not provided'}</span>
              </div>
            </div>

            {/* Organizational Role */}
            <div>
              <span className="text-zinc-500 block text-[11px] mb-0.5">Internal Role / Designation</span>
              <div className="flex items-center space-x-2 text-zinc-100 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>{admin.role || 'Admin'}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl text-[11px]">
            <div>
              <span className="text-zinc-500 block mb-0.5">Joined Date</span>
              <div className="flex items-center space-x-1.5 text-zinc-300 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>{formatDate(admin.createdAt)}</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Last Updated</span>
              <div className="flex items-center space-x-1.5 text-zinc-300 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>{formatDate(admin.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950/40 border-t border-zinc-800/80 flex items-center justify-end space-x-2.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(admin);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
            >
              Edit Details
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

