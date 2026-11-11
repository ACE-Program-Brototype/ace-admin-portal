import React from 'react';
import { AdminUser } from '../../types';
import {
  Briefcase,
  Users,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit2,
  Ban,
  CheckCircle2,
  ShieldAlert,
  Trash2
} from 'lucide-react';

interface AdminsTableProps {
  admins: AdminUser[];
  isLoading: boolean;
  onViewAdmin: (admin: AdminUser) => void;
  onEditAdmin: (admin: AdminUser) => void;
  onToggleBlockAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (admin: AdminUser) => void;
}

export const AdminsTable: React.FC<AdminsTableProps> = ({
  admins,
  isLoading,
  onViewAdmin,
  onEditAdmin,
  onToggleBlockAdmin,
  onDeleteAdmin
}) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden p-6">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3 w-1/4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800"></div>
                <div className="h-4 bg-zinc-800 rounded w-24"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-1/5"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/6"></div>
              <div className="h-6 bg-zinc-800 rounded w-24"></div>
              <div className="h-6 bg-zinc-800 rounded w-16"></div>
              <div className="h-4 bg-zinc-800 rounded w-16"></div>
              <div className="h-6 bg-zinc-800 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
          <Users className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-zinc-200">No administrators found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          No organizational administrator accounts matched your search.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {admins.map((admin) => {
              const adminId = admin.id || admin._id;
              const isBlocked = !!admin.isBlocked;

              return (
                <tr
                  key={adminId || admin.email}
                  className={`transition-colors duration-100 ${
                    isBlocked ? 'bg-red-500/[0.03] hover:bg-red-500/[0.06]' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  {/* Name and Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/70 text-zinc-200 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {getInitials(admin.name, admin.email)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-zinc-100">{admin.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {admin.phone ? (
                      <div className="flex items-center space-x-1.5 text-zinc-300">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span>{admin.phone}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Internal Organizational Role */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800/90 text-zinc-200 border border-zinc-700/60">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{admin.role || 'Admin'}</span>
                    </span>
                  </td>

                  {/* Block / Active Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isBlocked ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/25">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        <span>Blocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDate(admin.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions: View (Eye), Edit (Pencil), Block/Unblock (Shield) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      {/* View Details (Eye Icon) */}
                      <button
                        type="button"
                        onClick={() => onViewAdmin(admin)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
                        title={`View ${admin.name}'s details`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Admin */}
                      <button
                        type="button"
                        onClick={() => onEditAdmin(admin)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
                        title={`Edit ${admin.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Block / Unblock Admin Option */}
                      <button
                        type="button"
                        onClick={() => onToggleBlockAdmin(admin)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isBlocked
                            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                            : 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                        title={isBlocked ? `Unblock ${admin.name}` : `Block ${admin.name}`}
                      >
                        {isBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Admin Option */}
                      <button
                        type="button"
                        onClick={() => onDeleteAdmin(admin)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title={`Delete ${admin.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
