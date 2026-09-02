import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import type { Document } from '@/types';
import { cn } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';

interface DeleteDialogProps {
  document?: Document;
  documents?: Document[];
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteDialog({
  document,
  documents,
  onClose,
  onDeleted,
}: DeleteDialogProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const items = document ? [document] : (documents ?? []);
  const itemLabel =
    items.length === 1
      ? `"${items[0].original_filename}"`
      : `${items.length} files`;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast(
        items.length === 1
          ? `"${items[0].original_filename}" deleted`
          : `${items.length} files deleted`,
        'success'
      );
      onDeleted();
      onClose();
    },
    onError: () => {
      addToast('Failed to delete file(s)', 'error');
    },
  });

  const handleDelete = () => {
    items.forEach((item) => deleteMutation.mutate(item.id));
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
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 size={16} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Delete {itemLabel}
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
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              This action cannot be undone. The file will be permanently removed and cannot be recovered.
            </p>
          </div>

          {items.length > 1 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]"
                >
                  <span className="text-sm text-gray-900 dark:text-white truncate">
                    {item.original_filename}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase ml-auto shrink-0">
                    {item.detected_file_type}
                  </span>
                </div>
              ))}
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
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2',
              'bg-red-500 hover:bg-red-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Trash2 size={14} />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence>{overlay}</AnimatePresence>,
    window.document.body
  );
}
