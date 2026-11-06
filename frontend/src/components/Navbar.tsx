import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

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

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 text-white font-bold text-xs flex items-center justify-center tracking-tight shadow-sm">
              ACE
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-zinc-100">Admin Portal</span>
              <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                Inquiries
              </span>
            </div>
          </div>

          {/* Right section: Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 flex items-center justify-center font-semibold text-[10px] border border-zinc-700">
                {getInitials(user?.name, user?.email)}
              </div>
              <span className="text-zinc-300 font-medium">{user?.email}</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
