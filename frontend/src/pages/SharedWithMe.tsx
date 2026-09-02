import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, Lock, Download, User, FileText, Eye } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import { motion } from 'framer-motion';
import {
  WorkspaceLayout,
  WorkspaceHeader,
  FilePreviewModal,
} from '@/components/workspace';
import { sharesApi } from '@/api/shares';
import { documentsApi } from '@/api/documents';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { cn, formatFileSize, formatDate } from '@/utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import type { Document, Share } from '@/types';

export default function SharedWithMe() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => sharesApi.getSharedWithMe(),
  });

  const shares: (Share & { share_id: string })[] =
    (data?.data as any)?.shares ??
    (data?.data as any)?.items ??
    [];

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const cardBg = isDark ? 'bg-white/[0.03]' : 'bg-white';
  const cardBorder = isDark ? 'border-white/[0.06]' : 'border-gray-100/80';
  const hoverBg = isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-50';

  const handleDownload = (share: Share & { share_id: string }) => {
    if (!share.document) return;
    documentsApi.download(share.document.id)
      .then(() => toast.success('Download started'))
      .catch(() => toast.error('Download failed'));
  };

  const handleView = async (share: Share & { share_id: string }) => {
    if (!share.document) return;
    try {
      // The shared-doc payload is partial; fetch the full document so the preview modal has mime/lock fields
      const res = await documentsApi.get(share.document.id);
      const doc = (res as any)?.data ?? res;
      if (doc && doc.id) {
        setPreviewDoc(doc as Document);
      } else {
        toast.error('Could not open preview');
      }
    } catch {
      toast.error('Could not open preview');
    }
  };

  return (
    <WorkspaceLayout>
      <div className="flex flex-col min-h-full">
        <WorkspaceHeader
          title={t('workspace.nav.shared')}
          subtitle={`${shares.length} shared`}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl border h-20 animate-pulse',
                    cardBg, cardBorder
                  )}
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && shares.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
                isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
              )}>
                <Users size={28} className={textSecondary} />
              </div>
              <h3 className={cn('text-lg font-semibold mb-1', textPrimary)}>
                Nothing shared with you yet
              </h3>
              <p className={cn('text-sm', textSecondary)}>
                Files shared by other users will appear here.
              </p>
            </div>
          )}

          {/* List */}
          {!isLoading && shares.length > 0 && (
            <div className="space-y-2">
              {shares.map((share, index) => (
                <motion.div
                  key={share.share_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                    cardBg, cardBorder,
                    share.document ? hoverBg : 'opacity-60'
                  )}
                >
                  {/* File icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
                  )}>
                    {share.document?.is_locked ? (
                      <Lock size={18} className="text-amber-400" />
                    ) : (
                      <FileText size={18} className={textSecondary} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium truncate', textPrimary)}>
                        {share.document?.original_filename ?? 'File no longer available'}
                      </p>
                      {share.document?.is_locked && (
                        <Lock size={12} className="text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={cn('flex items-center gap-1 text-xs', textSecondary)}>
                        <User size={11} />
                        {share.shared_by_username}
                      </span>
                      {share.document && (
                        <>
                          <span className={cn('text-xs', textMuted)}>
                            {formatFileSize(share.document.file_size)}
                          </span>
                          <span className={cn('text-xs capitalize px-1.5 py-0.5 rounded-full', isDark ? 'bg-white/[0.05] text-slate-400' : 'bg-gray-100 text-gray-500')}>
                            {share.permission === 'download' ? 'View + Download' : 'View only'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={cn('text-xs', textMuted)}>
                      {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                    </span>
                    <span className={cn('text-[10px]', textMuted)}>
                      {formatDate(share.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  {share.document && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleView(share)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isDark ? 'hover:bg-white/[0.08] text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
                        )}
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(share)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isDark ? 'hover:bg-white/[0.08] text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
                        )}
                        title="Download"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewDoc && (
        <FilePreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </WorkspaceLayout>
  );
}
