import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Inbox, ShieldCheck, LogOut, X } from 'lucide-react';
import { SignOutConfirmModal } from './SignOutConfirmModal';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      match: ['/dashboard', '/']
    },
    {
      name: 'Enquiries',
      path: '/enquiries',
      icon: Inbox,
      match: ['/enquiries']
    },
    ...(user?.isSuperAdmin || user?.role === 'superadmin' || user?.email === 'admin@ace.com'
      ? [
          {
            name: 'Admins',
            path: '/admins',
            icon: ShieldCheck,
            match: ['/admins']
          }
        ]
      : [])
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    logout();
  };

  const sidebarContent = (
    <aside className="w-64 h-full bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between select-none">
      {/* Top Section: Logo & Nav items */}
      <div className="flex-1 flex flex-col">
        {/* Branding */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 text-white font-bold text-xs flex items-center justify-center tracking-tight shadow-sm">
              ACE
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 tracking-tight">Admin Portal</div>
              <div className="text-[10px] text-zinc-500 font-medium">Brototype Community</div>
            </div>
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.match.includes(location.pathname) ||
              (item.path === '/dashboard' && location.pathname === '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800/90 text-white border border-zinc-700/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: User profile & Sign Out */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/40">
        {/* User Card */}
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-semibold text-xs border border-zinc-700/70 flex-shrink-0">
            {getInitials(user?.name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-zinc-200 truncate">{user?.name || 'Administrator'}</span>
              {user?.isSuperAdmin || user?.role === 'superadmin' || user?.email === 'admin@ace.com' ? (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex-shrink-0">
                  Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex-shrink-0 truncate max-w-[90px]" title={user?.role}>
                  {user?.role || 'Admin'}
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500 truncate font-mono">{user?.email}</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOutClick}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer with Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#09090b] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

