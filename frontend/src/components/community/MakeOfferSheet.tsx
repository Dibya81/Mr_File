import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, FileText } from 'lucide-react';
import { communityApi } from '@/api/community';
import { documentsApi } from '@/api/documents';
import { toast } from '@/hooks/useToast';
import type { CommunityRequest } from '@/types';
import { formatFileSize } from '@/utils/helpers';

interface Props {
  request: CommunityRequest;
  onClose: () => void;
}

export default function MakeOfferSheet({ request, onClose }: Props) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string>('');
  const [message, setMessage] = useState('');

  const { data: docsData } = useQuery({
    queryKey: ['my-public-docs'],
    queryFn: () => documentsApi.list({ visibility: 'public', per_page: 50 }),
  });

  const docs = (docsData?.data as any)?.documents ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      communityApi.offers.create(request.id, {
        document_id: selected,
        message: message.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Offer submitted');
      qc.invalidateQueries({ queryKey: ['community-request', request.id] });
      qc.invalidateQueries({ queryKey: ['community-my-offers'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to submit offer');
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Make an Offer</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Offer one of your public documents for: {request.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto">
            {docs.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                <FileText size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                You don't have any public documents to offer.
                <p className="mt-1">Set a document's visibility to "Public" first.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {docs.map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() => setSelected(d.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                        selected === d.id
                          ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {selected === d.id ? (
                        <CheckCircle2 size={16} className="text-primary-500 shrink-0" />
                      ) : (
                        <FileText size={16} className="text-gray-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.original_filename}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{d.detected_file_type} · {formatFileSize(d.file_size)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Add a note for the requester..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none"
                  />
                </div>
              </>
            )}
          </div>
          {docs.length > 0 && (
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={!selected || mutation.isPending}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50"
              >
                {mutation.isPending ? 'Submitting…' : 'Submit Offer'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
