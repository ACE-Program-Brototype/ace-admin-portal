import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  title = 'Portal',
  subtitle
}) => {
  const { user } = useAuth();

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
    <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur border-b border-zinc-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left section: Mobile menu trigger + Section title */}
          <div className="flex items-center space-x-3">
            {onMenuToggle && (
              <button
                type="button"
                onClick={onMenuToggle}
                className="lg:hidden text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-2.5">
              <span className="text-sm font-semibold text-zinc-100">{title}</span>
              {subtitle && (
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Right section: System Status & User pill (Sign out removed as requested) */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Connected</span>
            </div>

            <div className="flex items-center space-x-2.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 flex items-center justify-center font-semibold text-[10px] border border-zinc-700">
                {getInitials(user?.name, user?.email)}
              </div>
              <span className="hidden sm:inline text-zinc-300 font-medium truncate max-w-[180px]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
