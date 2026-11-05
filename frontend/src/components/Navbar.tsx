import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">ACE</span>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-400">Community Inquiries & Candidate Management</p>
            </div>
          </div>

          {/* Right section: Admin Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 bg-slate-800/60 border border-slate-700/60 py-1.5 px-3 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {getInitials(user?.name, user?.email)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {user?.email}
                </p>
              </div>
              <div className="ml-1 pl-2 border-l border-slate-700">
                <span className="inline-flex items-center text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

