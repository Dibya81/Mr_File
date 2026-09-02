import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Download, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharesApi } from '@/api/shares';
import type { Document, Share } from '@/types';
import { cn } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';

interface ShareDialogProps {
  document: Document;
  onClose: () => void;
}

export default function ShareDialog({ document: doc, onClose }: ShareDialogProps) {
  const [username, setUsername] = useState('');
  const [permission, setPermission] = useState<'view' | 'download'>('view');
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: sharesData, isLoading: loadingShares } = useQuery({
    queryKey: ['document-shares', doc.id],
    queryFn: () => sharesApi.getDocumentShares(doc.id),
  });

  const shares: (Share & { share_id: string })[] = sharesData?.data?.shares ?? [];

  const shareMutation = useMutation({
    mutationFn: () => sharesApi.share(doc.id, { username, permission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', doc.id] });
      setUsername('');
      addToast(`Shared with ${username}`, 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error?.message ?? 'Failed to share', 'error');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (shareId: string) => sharesApi.revoke(doc.id, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', doc.id] });
      addToast('Access revoked', 'success');
    },
    onError: () => {
      addToast('Failed to revoke access', 'error');
    },
  });

  const handleShare = () => {
    if (!username.trim()) return;
    shareMutation.mutate();
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
          'w-full max-w-md rounded-2xl overflow-hidden',
          'bg-white dark:bg-[#0B0F19]',
          'border border-gray-200 dark:border-white/10',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Share <span className="font-normal text-gray-500 dark:text-gray-400">"{doc.original_filename}"</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Username input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Share with
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                placeholder="username"
                className={cn(
                  'w-full pl-7 pr-3 py-2.5 rounded-xl text-sm transition',
                  'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500'
                )}
              />
            </div>
          </div>

          {/* Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPermission('view')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  permission === 'view'
                    ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-400'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                )}
              >
                <Eye size={14} />
                View only
              </button>
              <button
                onClick={() => setPermission('download')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  permission === 'download'
                    ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-400'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                )}
              >
                <Download size={14} />
                View + Download
              </button>
            </div>
          </div>

          {shareMutation.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={14} />
              {(shareMutation.error as any)?.response?.data?.error?.message ?? 'Share failed'}
            </div>
          )}

          {/* Existing shares */}
          {shares.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                People with access
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.share_id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-semibold shrink-0">
                        {share.shared_with_username[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {share.shared_with_username}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">
                          {share.permission === 'download' ? 'View + Download' : 'View only'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeMutation.mutate(share.share_id)}
                      disabled={revokeMutation.isPending}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
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
            onClick={handleShare}
            disabled={!username.trim() || shareMutation.isPending}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2',
              'bg-primary-600 hover:bg-primary-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <UserPlus size={14} />
            {shareMutation.isPending ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(<AnimatePresence>{overlay}</AnimatePresence>, document.body);
}
