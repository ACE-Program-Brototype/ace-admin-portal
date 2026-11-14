import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdmin } from '../../api/admins';
import { AdminUser, UpdateAdminPayload } from '../../types';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface EditAdminModalProps {
  admin: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({
  admin,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  // Password update toggle
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setPhone(admin.phone || '');
      setRole(admin.role || '');
      setChangePassword(false);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage(null);
    }
  }, [admin]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && admin) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admin, onClose]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateAdminPayload) =>
      updateAdmin(admin?.id || admin?._id || '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to update administrator details.';
      if (axios.isAxiosError<{ message?: string }>(err)) {
        msg = err.response?.data?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    }
  });

  if (!admin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedRole = role.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Full name is required (at least 2 characters).');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!trimmedRole || trimmedRole.length < 2) {
      setErrorMessage('Please specify an internal role or designation within the organization.');
      return;
    }

    if (trimmedPhone && !/^\d{7,15}$/.test(trimmedPhone.replace(/\D/g, ''))) {
      setErrorMessage('Phone number must contain between 7 and 15 digits.');
      return;
    }

    const payload: UpdateAdminPayload = {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone.replace(/\D/g, ''),
      role: trimmedRole
    };

    if (changePassword) {
      if (!password || password.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('New passwords do not match. Please verify your confirmation password.');
        return;
      }
      payload.password = password;
    }

    mutation.mutate(payload);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-200 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Edit Administrator</h2>
              <p className="text-[11px] text-zinc-400">Update account credentials and organizational role</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="text-[11px] leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="e.g. 9847012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
              />
            </div>
          </div>

          {/* Internal Role */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Role / Designation <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Operations Lead, Community Manager, Admissions Counsellor..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
              />
            </div>
          </div>

          {/* Password Reset Toggle */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-zinc-200 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Administrator Password</span>
              </span>
            </label>

            {changePassword && (
              <div className="mt-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3 animate-in fade-in duration-100">
                {/* New Password */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Confirm New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{mutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

