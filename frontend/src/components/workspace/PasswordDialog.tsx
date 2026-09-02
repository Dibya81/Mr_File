import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import type { Document } from '@/types';
import { cn } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';

interface PasswordDialogProps {
  document: Document;
  mode: 'lock' | 'unlock';
  onClose: () => void;
}

export default function PasswordDialog({ document: doc, mode, onClose }: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const lockMutation = useMutation({
    mutationFn: (pw: string) => documentsApi.lock(doc.id, pw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast(`"${doc.original_filename}" is now locked`, 'success');
      onClose();
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error?.message ?? 'Failed to lock file', 'error');
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (pw: string) => documentsApi.unlock(doc.id, pw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast(`"${doc.original_filename}" is now unlocked`, 'success');
      onClose();
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error?.message ?? 'Incorrect password', 'error');
    },
  });

  const isLoading = mode === 'lock' ? lockMutation.isPending : unlockMutation.isPending;
  const mutation = mode === 'lock' ? lockMutation : unlockMutation;

  const handleSubmit = () => {
    if (mode === 'lock') {
      if (password.length < 4) {
        addToast('Password must be at least 4 characters', 'error');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }
      lockMutation.mutate(password);
    } else {
      if (!password) return;
      unlockMutation.mutate(password);
    }
  };

  const overlay = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-sm rounded-2xl overflow-hidden',
          'bg-white dark:bg-[#0B0F19]',
          'border border-gray-200 dark:border-white/10',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center',
              mode === 'lock' ? 'bg-amber-500/10' : 'bg-green-500/10'
            )}>
              <Lock
                size={16}
                className={mode === 'lock' ? 'text-amber-500' : 'text-green-500'}
              />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {mode === 'lock' ? 'Lock' : 'Unlock'} File
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'lock'
              ? `Set a password to lock "${doc.original_filename}". You will need this password to access the file.`
              : `Enter the password to unlock "${doc.original_filename}".`}
          </p>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={mode === 'lock' ? 'Set a password' : 'Enter password'}
                className={cn(
                  'w-full pl-9 pr-10 py-2.5 rounded-xl text-sm transition',
                  'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500'
                )}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password (lock mode only) */}
          {mode === 'lock' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Confirm password"
                  className={cn(
                    'w-full pl-9 pr-10 py-2.5 rounded-xl text-sm transition',
                    'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10',
                    'text-gray-900 dark:text-white placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={14} />
              {(mutation.error as any)?.response?.data?.error?.message ?? 'An error occurred'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition border',
              'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-white/10'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !password ||
              (mode === 'lock' && password !== confirmPassword)
            }
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition',
              mode === 'lock'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading
              ? 'Processing...'
              : mode === 'lock'
              ? 'Lock File'
              : 'Unlock File'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence>{overlay}</AnimatePresence>,
    document.body
  );
}
