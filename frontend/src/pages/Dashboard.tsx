import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Upload, UploadCloud, FolderPlus, LayoutGrid, List, ArrowUpRight,
  FolderOpen, Clock, ShieldCheck, HardDrive, Sparkles, FileText,
  ArrowDownAZ, Star, Filter,
} from 'lucide-react';
import {
  WorkspaceLayout,
  WorkspaceHeader,
  FileGrid,
  FileListView,
  FileContextMenu,
  FileDetailsPanel,
  ShareDialog,
  PasswordDialog,
  MoveDialog,
  DeleteDialog,
  StatusBadge,
} from '@/components/workspace';
import FilePreviewModal from '@/components/workspace/FilePreviewModal';
import { documentsApi } from '@/api/documents';
import { foldersApi } from '@/api/folders';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';
import { cn, formatFileSize } from '@/utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '@/types';

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'updated_at' | 'original_filename' | 'file_size' | 'detected_file_type';

export default function Dashboard() {
  const { t } = useTranslation();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';
  const user = useAuthStore((s) => s.user);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [fileType, setFileType] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [contextMenuDoc, setContextMenuDoc] = useState<Document | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showShare, setShowShare] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build breadcrumbs
  const breadcrumbs: { label: string; href?: string }[] = folderId
    ? [{ label: t('workspace.folder.root'), href: '/dashboard' }]
    : [];

  // Fetch folder name if inside a folder
  const { data: folderData } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: () => foldersApi.get(folderId!),
    enabled: !!folderId,
  });
  const folderName = folderData?.data?.name;
  if (folderId && folderName) {
    breadcrumbs.push({ label: folderName, href: undefined });
  }

  // Fetch documents
  const { data: docsData, isLoading } = useQuery({
    queryKey: ['documents', folderId, sortBy, sortOrder, fileType],
    queryFn: () =>
      documentsApi.list({
        folder_id: folderId ?? '',
        sort_by: sortBy,
        sort_order: sortOrder,
        file_type: fileType || undefined,
        per_page: 100,
      }),
  });

  const documents: Document[] =
    (docsData?.data as any)?.documents ??
    (docsData?.data as any)?.items ??
    [];

  // Fetch folders
  const { data: foldersData } = useQuery({
    queryKey: ['folders', folderId],
    queryFn: () => foldersApi.list(folderId),
  });
  const folders = foldersData?.data?.folders ?? [];

  // Recent files (root only) — show 5
  const { data: recentData } = useQuery({
    queryKey: ['documents-recent'],
    queryFn: () => documentsApi.recent(5),
    enabled: !folderId,
  });
  const recentDocs: Document[] =
    (recentData?.data as any)?.documents ??
    (recentData?.data as any)?.items ??
    [];

  // Stats (root only) — single lightweight aggregate query, no document bodies
  const { data: statsData } = useQuery({
    queryKey: ['documents-stats'],
    queryFn: () => documentsApi.stats(),
    enabled: !folderId,
    staleTime: 30_000,
  });
  const stats = statsData?.data;
  const totalCount = stats?.total_count ?? 0;
  const totalSize = stats?.total_size ?? 0;
  const processingCount = stats?.processing_count ?? 0;
  const completedCount = stats?.completed_count ?? 0;
  const starredCount = stats?.starred_count ?? 0;

  // Upload mutation — fires when files are dropped/picked
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results = [];
      for (const file of files) {
        const result = await documentsApi.upload(file, folderId);
        results.push(result);
      }
      return results;
    },
    onSuccess: (results) => {
      toast.success(`${results.length} file${results.length === 1 ? '' : 's'} uploaded`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents-recent'] });
      queryClient.invalidateQueries({ queryKey: ['starred-documents'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Upload failed');
    },
  });

  // Folder create mutation
  const createFolderMutation = useMutation({
    mutationFn: foldersApi.create,
    onSuccess: () => {
      setShowNewFolder(false);
      setNewFolderName('');
      queryClient.invalidateQueries({ queryKey: ['folders', folderId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-folders'] });
      toast.success('Folder created');
    },
    onError: () => toast.error('Failed to create folder'),
  });

  const handleDocClick = (doc: Document) => setSelectedDoc(doc);

  const handleDocContextMenu = (e: React.MouseEvent, doc: Document) => {
    e.preventDefault();
    setContextMenuDoc(doc);
  };

  const closeAll = () => {
    setShowShare(false);
    setShowLock(false);
    setShowMove(false);
    setShowDelete(false);
    setContextMenuDoc(null);
  };

  const title = folderId
    ? folderName ?? t('workspace.folder.allFiles')
    : t('workspace.nav.dashboard');

  const subtitle = !folderId
    ? `${totalCount} files · ${formatFileSize(totalSize)}`
    : `${documents.length} files · ${formatFileSize(documents.reduce((s, d) => s + (d.file_size || 0), 0))}`;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    uploadMutation.mutate(arr);
  }, [uploadMutation]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) setIsDragging(false);
  };

  // Theme tokens
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const cardBorder = isDark ? 'border-slate-800/80' : 'border-gray-200';
  const statCardBg = isDark ? 'bg-white/[0.03] border border-slate-800/80' : 'bg-white border border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50';
  const dashedBorder = isDark ? 'border-slate-700' : 'border-gray-300';
  const dashedBg = isDark ? 'bg-slate-900/40' : 'bg-gray-50';

  const isEmpty = !folderId && totalCount === 0 && folders.length === 0 && !isLoading;

  return (
    <WorkspaceLayout>
      <div
        className="flex flex-col min-h-full relative"
        onDragOver={!folderId ? onDragOver : undefined}
        onDragLeave={!folderId ? onDragLeave : undefined}
        onDrop={!folderId ? onDrop : undefined}
      >
        <WorkspaceHeader
          title={title}
          subtitle={subtitle}
          breadcrumb={breadcrumbs}
          onSelectFile={(docId) => {
            const doc = documents.find((d) => d.id === docId) || recentDocs.find((d) => d.id === docId);
            if (doc) setSelectedDoc(doc);
          }}
          actions={
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  'bg-blue-600 hover:bg-blue-500 text-white',
                  'shadow-lg shadow-blue-500/20',
                  uploadMutation.isPending && 'opacity-60 cursor-wait'
                )}
              >
                <Upload size={15} />
                <span className="hidden sm:inline">
                  {uploadMutation.isPending ? 'Uploading...' : t('workspace.dashboard.uploadFiles')}
                </span>
                <span className="sm:hidden">Upload</span>
              </button>
              <button
                onClick={() => setShowNewFolder(true)}
                className={cn(
                  'p-2 rounded-lg transition-colors border',
                  isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-slate-800/80'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                )}
                title={t('workspace.dashboard.newFolder')}
              >
                <FolderPlus size={15} />
              </button>
            </>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (e.target) e.target.value = '';
          }}
        />

        {/* Folder create inline form */}
        {showNewFolder && (
          <div className={cn(
            'mx-4 sm:mx-6 mt-4 flex items-center gap-2 p-3 rounded-lg border',
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-gray-50 border-gray-200'
          )}>
            <FolderOpen size={16} className="text-blue-500 shrink-0" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  createFolderMutation.mutate({ name: newFolderName.trim() });
                } else if (e.key === 'Escape') {
                  setShowNewFolder(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name"
              autoFocus
              className={cn(
                'flex-1 px-2 py-1 text-sm rounded-md border bg-transparent focus:outline-none focus:ring-1',
                isDark
                  ? 'border-slate-700 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/30'
                  : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500/30'
              )}
            />
            <button
              onClick={() => newFolderName.trim() && createFolderMutation.mutate({ name: newFolderName.trim() })}
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
              className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md border',
                isDark ? 'border-slate-700 text-slate-400 hover:bg-white/[0.04]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'
              )}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Quick stats — only on root, when there is content */}
          {!folderId && !isEmpty && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={<FileText size={16} className="text-blue-400" />}
                label={t('workspace.dashboard.stat_totalFiles')}
                value={totalCount.toString()}
                isDark={isDark}
                cardClass={statCardBg}
              />
              <StatCard
                icon={<HardDrive size={16} className="text-emerald-400" />}
                label={t('workspace.dashboard.stat_storage')}
                value={formatFileSize(totalSize)}
                isDark={isDark}
                cardClass={statCardBg}
              />
              <StatCard
                icon={<Sparkles size={16} className="text-purple-400" />}
                label={t('workspace.dashboard.stat_aiProcessed')}
                value={completedCount.toString()}
                isDark={isDark}
                cardClass={statCardBg}
              />
              <StatCard
                icon={<Star size={16} className="text-amber-400 fill-amber-400" />}
                label={t('workspace.dashboard.stat_starred')}
                value={starredCount.toString()}
                isDark={isDark}
                cardClass={statCardBg}
                href="/dashboard/starred"
              />
            </div>
          )}

          {/* Recent files (root only, above folder/file view) */}
          {!folderId && recentDocs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={cn('text-sm font-semibold flex items-center gap-2', textSecondary)}>
                  <Clock size={14} />
                  {t('workspace.dashboard.recentFiles')}
                </h3>
                <Link
                  to="/dashboard/recent"
                  className={cn('text-xs hover:underline transition-colors', isDark ? 'text-blue-400' : 'text-primary-600')}
                >
                  {t('workspace.dashboard.viewAll')} →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
                {recentDocs.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocClick(doc)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                      cardBorder,
                      isDark ? 'hover:bg-white/[0.04] hover:border-slate-700' : 'hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                    )}>
                      <FileText size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', textPrimary)}>
                        {doc.original_filename}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn('text-xs', textMuted)}>
                          {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={13} className={textMuted} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h3 className={cn('text-sm font-semibold mb-3 flex items-center gap-2', textSecondary)}>
                <FolderOpen size={14} />
                Folders
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    to={`/dashboard/folder/${folder.id}`}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-xl border transition-colors',
                      cardBorder,
                      isDark ? 'hover:bg-white/[0.04] hover:border-slate-700' : 'hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <FolderOpen size={18} className="text-blue-500 shrink-0" />
                    <span className={cn('text-sm font-medium truncate', textPrimary)}>
                      {folder.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar + File list */}
          {(documents.length > 0 || isLoading) && (
            <div>
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <h3 className={cn('text-sm font-semibold flex items-center gap-2', textSecondary)}>
                  <FileText size={14} />
                  {folderId ? folderName ?? t('workspace.folder.allFiles') : t('workspace.folder.allFiles')}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sort */}
                  <div className={cn(
                    'flex items-center gap-1 rounded-lg border overflow-hidden',
                    isDark ? 'border-slate-800/80 bg-white/[0.02]' : 'border-gray-200 bg-white'
                  )}>
                    <ArrowDownAZ size={13} className={cn('ml-2', textMuted)} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className={cn(
                        'px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-none focus:ring-0',
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      )}
                    >
                      <option value="updated_at">{t('workspace.sort.date')}</option>
                      <option value="created_at">{t('workspace.sort.date')}</option>
                      <option value="original_filename">{t('workspace.sort.name')}</option>
                      <option value="file_size">{t('workspace.sort.size')}</option>
                      <option value="detected_file_type">{t('workspace.sort.type')}</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className={cn('px-2 py-1.5 text-xs border-l', isDark ? 'border-slate-800/80 text-slate-400' : 'border-gray-200 text-gray-500', hoverBg)}
                      title="Toggle order"
                    >
                      {sortOrder === 'desc' ? '↓' : '↑'}
                    </button>
                  </div>

                  {/* Type filter */}
                  <div className={cn(
                    'hidden sm:flex items-center gap-1 rounded-lg border overflow-hidden',
                    isDark ? 'border-slate-800/80 bg-white/[0.02]' : 'border-gray-200 bg-white'
                  )}>
                    <Filter size={13} className={cn('ml-2', textMuted)} />
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className={cn(
                        'px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-none focus:ring-0',
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      )}
                    >
                      <option value="">{t('workspace.filter.all')}</option>
                      <option value="pdf">{t('workspace.filter.pdf')}</option>
                      <option value="docx">{t('workspace.filter.docx')}</option>
                      <option value="xlsx">{t('workspace.filter.xlsx')}</option>
                      <option value="pptx">{t('workspace.filter.pptx')}</option>
                    </select>
                  </div>

                  {/* View mode */}
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
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={cn(
                      'rounded-xl h-32 animate-pulse',
                      isDark ? 'bg-white/[0.03]' : 'bg-gray-100'
                    )} />
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <FileGrid
                  documents={documents}
                  onSelect={handleDocClick}
                  onContextMenu={(doc, e) => {
                    e.preventDefault();
                    setContextMenuPos({ x: e.clientX, y: e.clientY });
                    setContextMenuDoc(doc);
                  }}
                />
              ) : (
                <FileListView
                  documents={documents}
                  onSelect={handleDocClick}
                  onContextMenu={(doc, e) => {
                    e.preventDefault();
                    setContextMenuPos({ x: e.clientX, y: e.clientY });
                    setContextMenuDoc(doc);
                  }}
                />
              )}
            </div>
          )}

          {/* Empty folder (inside a folder) */}
          {folderId && documents.length === 0 && folders.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FolderOpen size={36} className={textMuted} />
              <p className={cn('mt-3 text-sm font-medium', textSecondary)}>
                {t('workspace.folder.empty')}
              </p>
            </div>
          )}
        </div>

        {/* Centered empty state — fills the screen, big drop zone */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 -mt-8">
            <div className="text-center mb-8 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <Sparkles size={13} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-400">
                  {(() => {
                    const hour = new Date().getHours();
                    const timeKey = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
                    return `Good ${timeKey}${user?.username ? `, ${user.username}` : ''}`;
                  })()}
                </span>
              </div>
              <h1 className={cn('text-2xl sm:text-3xl font-semibold mb-2', textPrimary)}>
                {t('workspace.dashboard.readyTitle')}
              </h1>
              <p className={cn('text-sm', textSecondary)}>
                {t('workspace.dashboard.subtitle')}
              </p>
            </div>

            {/* Big drop zone */}
            <label
              className={cn(
                'group w-full max-w-2xl cursor-pointer',
                'border-2 border-dashed rounded-2xl p-12 text-center transition-all',
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                  : cn(dashedBorder, dashedBg, 'hover:border-blue-500 hover:bg-blue-500/5')
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  if (e.target) e.target.value = '';
                }}
              />
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center transition-all',
                  isDragging
                    ? 'bg-blue-500/20 shadow-2xl shadow-blue-500/30'
                    : isDark ? 'bg-blue-500/10 group-hover:bg-blue-500/20 shadow-xl shadow-blue-500/10' : 'bg-blue-50 group-hover:bg-blue-100 shadow-xl shadow-blue-500/10'
                )}>
                  <UploadCloud
                    size={36}
                    className={cn(
                      'transition-colors',
                      isDragging ? 'text-blue-400' : 'text-blue-500'
                    )}
                  />
                </div>
                <div>
                  <p className={cn('text-lg font-semibold mb-1', textPrimary)}>
                    {isDragging ? t('workspace.dashboard.dropZoneActive') : t('workspace.dashboard.dropZoneTitle')}
                  </p>
                  <p className={cn('text-sm', textSecondary)}>
                    {t('workspace.dashboard.dropZoneHint')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploadMutation.isPending}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
                    uploadMutation.isPending && 'opacity-60 cursor-wait'
                  )}
                >
                  <Upload size={15} />
                  {uploadMutation.isPending ? 'Uploading...' : t('workspace.dashboard.browseFiles')}
                </button>
              </div>
            </label>

            {/* Below: secondary "create folder" path */}
            <button
              onClick={() => setShowNewFolder(true)}
              className={cn(
                'mt-5 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <FolderPlus size={14} />
              {t('workspace.dashboard.createFolderHint')}
            </button>
          </div>
        )}

        {/* Drag overlay (visible when dragging over the whole page) */}
        {isDragging && !isEmpty && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 m-4 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <UploadCloud size={48} className="text-blue-400" />
              <p className="text-lg font-semibold text-white">{t('workspace.dashboard.dropZoneActive')}</p>
            </div>
          </div>
        )}
      </div>

      {/* File Details Panel */}
      {selectedDoc && (
        <FileDetailsPanel
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onView={() => setPreviewDoc(selectedDoc)}
          onDownload={() => {
            documentsApi.download(selectedDoc.id)
              .then(() => toast.success('Download started'))
              .catch(() => toast.error('Download failed'));
          }}
          onShare={() => { setShowShare(true); }}
          onLock={() => { setShowLock(true); }}
          onMove={() => { setShowMove(true); }}
          onDelete={() => { setShowDelete(true); }}
        />
      )}

      {/* Context Menu */}
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
                documentsApi.download(doc.id)
                  .then(() => toast.success('Download started'))
                  .catch(() => toast.error('Download failed'));
                break;
              case 'share':
                setSelectedDoc(doc);
                setShowShare(true);
                break;
              case 'lock':
                setSelectedDoc(doc);
                setShowLock(true);
                break;
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

      {/* Share Dialog */}
      {showShare && selectedDoc && (
        <ShareDialog
          document={selectedDoc}
          onClose={() => { closeAll(); setShowShare(false); }}
        />
      )}

      {/* Lock/Unlock Dialog */}
      {showLock && selectedDoc && (
        <PasswordDialog
          document={selectedDoc}
          mode={selectedDoc.is_locked ? 'unlock' : 'lock'}
          onClose={() => { closeAll(); setShowLock(false); }}
        />
      )}

      {/* Move Dialog */}
      {showMove && selectedDoc && (
        <MoveDialog
          document={selectedDoc}
          currentFolderId={folderId}
          onClose={() => { closeAll(); setShowMove(false); }}
          onMoved={() => { setSelectedDoc(null); }}
        />
      )}

      {/* Delete Dialog */}
      {showDelete && selectedDoc && (
        <DeleteDialog
          document={selectedDoc}
          onClose={() => { closeAll(); setShowDelete(false); }}
          onDeleted={() => { setSelectedDoc(null); }}
        />
      )}

      {previewDoc && (
        <FilePreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </WorkspaceLayout>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isDark: boolean;
  cardClass: string;
  href?: string;
}

function StatCard({ icon, label, value, isDark, cardClass, href }: StatCardProps) {
  const Wrapper: any = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl transition-colors',
        cardClass,
        href && (isDark ? 'hover:bg-white/[0.05] hover:border-slate-700' : 'hover:bg-gray-50 hover:border-gray-300')
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
        isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
      )}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-xs font-medium uppercase tracking-wider truncate',
          isDark ? 'text-slate-500' : 'text-gray-500'
        )}>
          {label}
        </p>
        <p className={cn(
          'text-lg font-semibold leading-tight mt-0.5 truncate',
          isDark ? 'text-white' : 'text-gray-900'
        )}>
          {value}
        </p>
      </div>
    </Wrapper>
  );
}
