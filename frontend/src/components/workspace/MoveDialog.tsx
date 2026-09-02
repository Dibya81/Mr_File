import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, ChevronRight, ChevronDown, FolderPlus, FolderInput, Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import { foldersApi } from '@/api/folders';
import type { Document, Folder } from '@/types';
import { cn } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';

interface MoveDialogProps {
  document?: Document;
  documents?: Document[];
  currentFolderId?: string;
  onClose: () => void;
  onMoved: () => void;
}

interface FolderNode extends Folder {
  children?: FolderNode[];
  expanded?: boolean;
}

function FolderTree({
  folders,
  selectedId,
  onSelect,
  depth = 0,
}: {
  folders: FolderNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  depth?: number;
}) {
  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <div key={folder.id}>
          <button
            onClick={() => onSelect(folder.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition',
              selectedId === folder.id
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05]'
            )}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {selectedId === folder.id ? (
              <Check size={13} className="shrink-0 text-primary-500" />
            ) : (
              <FolderOpen size={14} className="shrink-0 text-primary-400" />
            )}
            <span className="truncate">{folder.name}</span>
          </button>
          {folder.children && folder.children.length > 0 && (
            <FolderTree
              folders={folder.children}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function buildFolderTree(folders: Folder[], parentId: string | null = null): FolderNode[] {
  return folders
    .filter((f) => f.parent_folder_id === parentId)
    .map((f) => ({
      ...f,
      children: buildFolderTree(folders, f.id),
    }));
}

export default function MoveDialog({
  document,
  documents,
  currentFolderId,
  onClose,
  onMoved,
}: MoveDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const items = document ? [document] : (documents ?? []);
  const itemLabel = items.length === 1
    ? `"${items[0].original_filename}"`
    : `${items.length} files`;

  const { data: allFoldersData, isLoading: loadingFolders } = useQuery({
    queryKey: ['folders', 'all'],
    queryFn: () => foldersApi.list(),
  });

  const allFolders: Folder[] = allFoldersData?.data?.folders ?? [];
  const rootFolders = buildFolderTree(allFolders, null);

  const moveMutation = useMutation({
    mutationFn: async ({ docId, folderId }: { docId: string; folderId: string | null }) => {
      if (folderId === null) {
        return documentsApi.update(docId, { folder_id: '' as any });
      }
      return documentsApi.update(docId, { folder_id: folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast(`Moved ${itemLabel} successfully`, 'success');
      onMoved();
      onClose();
    },
    onError: () => {
      addToast('Failed to move file(s)', 'error');
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      foldersApi.create({
        name,
        parent_folder_id: selectedFolderId ?? undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['folders', 'all'] });
      setNewFolderName('');
      setShowNewFolder(false);
      setSelectedFolderId(res.data.id);
      addToast(`Folder "${name}" created`, 'success');
    },
    onError: () => {
      addToast('Failed to create folder', 'error');
    },
  });

  const handleMove = () => {
    items.forEach((item) => {
      moveMutation.mutate({ docId: item.id, folderId: selectedFolderId });
    });
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
          'w-full max-w-lg rounded-2xl overflow-hidden',
          'bg-white dark:bg-[#0B0F19]',
          'border border-gray-200 dark:border-white/10',
          'shadow-2xl flex flex-col max-h-[70vh]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <FolderInput size={16} className="text-primary-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Move {itemLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 px-3 mb-2">
            Select destination
          </p>

          {/* Root option */}
          <button
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition',
              selectedFolderId === null
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05]'
            )}
          >
            {selectedFolderId === null ? (
              <Check size={13} className="shrink-0 text-primary-500" />
            ) : (
              <FolderOpen size={14} className="shrink-0 text-gray-400" />
            )}
            <span>Root (Home)</span>
          </button>

          {loadingFolders ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-xl skeleton-shimmer bg-gray-100 dark:bg-white/5" />
              ))}
            </div>
          ) : rootFolders.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-4 text-center">
              No folders yet
            </p>
          ) : (
            <FolderTree
              folders={rootFolders}
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
            />
          )}
        </div>

        {/* New folder */}
        <div className="px-4 pb-2 shrink-0">
          {showNewFolder ? (
            <div className="flex gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    createFolderMutation.mutate(newFolderName.trim());
                  }
                }}
                placeholder="Folder name"
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm',
                  'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50'
                )}
                autoFocus
              />
              <button
                onClick={() => createFolderMutation.mutate(newFolderName.trim())}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition"
              >
                Create
              </button>
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05] rounded-xl transition"
            >
              <FolderPlus size={14} />
              Create folder here
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
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
            onClick={handleMove}
            disabled={
              moveMutation.isPending ||
              (selectedFolderId === (currentFolderId ?? null))
            }
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2',
              'bg-primary-600 hover:bg-primary-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <FolderInput size={14} />
            {moveMutation.isPending ? 'Moving...' : 'Move Here'}
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
