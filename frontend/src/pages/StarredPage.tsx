import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star, LayoutGrid, List } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import {
  WorkspaceLayout,
  WorkspaceHeader,
  FileGrid,
  FileListView,
  FileContextMenu,
  FileDetailsPanel,
  FilePreviewModal,
  ShareDialog,
  PasswordDialog,
  MoveDialog,
  DeleteDialog,
} from '@/components/workspace';
import { documentsApi } from '@/api/documents';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { cn } from '@/utils/helpers';
import type { Document } from '@/types';

type ViewMode = 'grid' | 'list';

export default function StarredPage() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [contextMenuDoc, setContextMenuDoc] = useState<Document | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showShare, setShowShare] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['starred-documents'],
    queryFn: () => documentsApi.starred(100),
  });

  const documents: Document[] =
    (data?.data as any)?.documents ??
    (data?.data as any)?.items ??
    [];

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';

  const handleDownload = (doc: Document) => {
    documentsApi.download(doc.id)
      .then(() => toast.success('Download started'))
      .catch(() => toast.error('Download failed'));
  };

  const closeAll = () => {
    setShowShare(false);
    setShowLock(false);
    setShowMove(false);
    setShowDelete(false);
    setContextMenuDoc(null);
  };

  return (
    <WorkspaceLayout>
      <div className="flex flex-col min-h-full">
        <WorkspaceHeader
          title={t('workspace.nav.starred')}
          subtitle={t('workspace.dashboard.files', { count: documents.length })}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className={cn('text-sm', textSecondary)}>
              {t('workspace.dashboard.starredSubtitle')}
            </p>
            <div className={cn(
              'flex rounded-lg border overflow-hidden',
              isDark ? 'border-slate-800/80' : 'border-gray-200'
            )}>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? isDark ? 'bg-white/[0.06] text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                )}
                title={t('workspace.view.grid')}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list'
                    ? isDark ? 'bg-white/[0.06] text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                )}
                title={t('workspace.view.list')}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={cn(
                  'rounded-xl h-32 animate-pulse',
                  isDark ? 'bg-white/[0.03]' : 'bg-gray-100'
                )} />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-5',
                isDark ? 'bg-amber-500/10' : 'bg-amber-50'
              )}>
                <Star size={32} className="text-amber-400 fill-amber-400" />
              </div>
              <h3 className={cn('text-lg font-semibold mb-1', textPrimary)}>
                {t('workspace.dashboard.noStarred')}
              </h3>
              <p className={cn('text-sm max-w-sm', textSecondary)}>
                {t('workspace.dashboard.starredSubtitle')}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              documents={documents}
              onSelect={setSelectedDoc}
              onContextMenu={(doc, e) => {
                e.preventDefault();
                setContextMenuPos({ x: e.clientX, y: e.clientY });
                setContextMenuDoc(doc);
              }}
            />
          ) : (
            <FileListView
              documents={documents}
              onSelect={setSelectedDoc}
              onContextMenu={(doc, e) => {
                e.preventDefault();
                setContextMenuPos({ x: e.clientX, y: e.clientY });
                setContextMenuDoc(doc);
              }}
            />
          )}
        </div>
      </div>

      {selectedDoc && (
        <FileDetailsPanel
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onView={() => setPreviewDoc(selectedDoc)}
          onDownload={() => handleDownload(selectedDoc)}
          onShare={() => setShowShare(true)}
          onLock={() => setShowLock(true)}
          onMove={() => setShowMove(true)}
          onDelete={() => setShowDelete(true)}
        />
      )}

      {contextMenuDoc && (
        <FileContextMenu
          document={contextMenuDoc}
          position={contextMenuPos}
          onClose={() => setContextMenuDoc(null)}
          onAction={(action) => {
            const doc = contextMenuDoc;
            setContextMenuDoc(null);
            switch (action) {
              case 'open':
                setSelectedDoc(doc);
                break;
              case 'download':
                handleDownload(doc);
                break;
              case 'share':
                setSelectedDoc(doc);
                setShowShare(true);
                break;
              case 'lock':
              case 'unlock':
                setSelectedDoc(doc);
                setShowLock(true);
                break;
              case 'move':
                setSelectedDoc(doc);
                setShowMove(true);
                break;
              case 'delete':
                setSelectedDoc(doc);
                setShowDelete(true);
                break;
            }
          }}
        />
      )}

      {showShare && selectedDoc && (
        <ShareDialog document={selectedDoc} onClose={() => { closeAll(); setShowShare(false); }} />
      )}
      {showLock && selectedDoc && (
        <PasswordDialog
          document={selectedDoc}
          mode={selectedDoc.is_locked ? 'unlock' : 'lock'}
          onClose={() => { closeAll(); setShowLock(false); }}
        />
      )}
      {showMove && selectedDoc && (
        <MoveDialog document={selectedDoc} onClose={() => { closeAll(); setShowMove(false); }} onMoved={() => setSelectedDoc(null)} />
      )}
      {showDelete && selectedDoc && (
        <DeleteDialog document={selectedDoc} onClose={() => { closeAll(); setShowDelete(false); }} onDeleted={() => setSelectedDoc(null)} />
      )}

      {previewDoc && (
        <FilePreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </WorkspaceLayout>
  );
}
