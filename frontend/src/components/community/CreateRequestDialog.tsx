import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { communityApi } from '@/api/community';
import { toast } from '@/hooks/useToast';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

const DOC_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'id', label: 'ID' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

export default function CreateRequestDialog({ onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      communityApi.requests.create({
        title: title.trim(),
        description: description.trim() || undefined,
        document_type: documentType || undefined,
      }),
    onSuccess: () => {
      toast.success('Request posted');
      qc.invalidateQueries({ queryKey: ['community-requests'] });
      qc.invalidateQueries({ queryKey: ['community-my-requests'] });
      onCreated?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to create request');
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">New Request</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim().length < 3) {
                toast.error('Title is required (min 3 chars)');
                return;
              }
              mutation.mutate();
            }}
            className="p-5 space-y-4"
          >
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Looking for an invoice template"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                required
                maxLength={500}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any details that would help (type, date range, format)..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                <option value="">Any</option>
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50"
              >
                {mutation.isPending ? 'Posting…' : 'Post Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
