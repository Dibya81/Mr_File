import { Download, Share2, MoreVertical, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Document } from '@/types';
import { cn, formatFileSize } from '@/utils/helpers';
import FileIcon from './FileIcon';
import StatusBadge from './StatusBadge';
import StarButton from './StarButton';
import VisibilityBadge from './VisibilityBadge';
import { formatDistanceToNow } from 'date-fns';

interface FileRowProps {
  document: Document;
  onSelect?: () => void;
  onOpenContextMenu?: (e: React.MouseEvent) => void;
  onDownload?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}

export default function FileRow({
  document: doc,
  onSelect,
  onOpenContextMenu,
  onDownload,
  onShare,
  onMore,
}: FileRowProps) {
  const type = doc.detected_file_type.toLowerCase();
  const [showActions, setShowActions] = useState(false);

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-select]')) return;
    onSelect?.();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMore?.();
  };

  return (
    <div
      onClick={handleRowClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContextMenu?.(e);
      }}
      className={cn(
        'group flex items-center gap-4 px-4 py-3 cursor-pointer select-none transition-colors duration-150',
        'hover:bg-gray-50 dark:hover:bg-white/[0.02]',
        'border-b border-gray-100 dark:border-white/5 last:border-0'
      )}
    >
      {/* Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileIcon
          type={type}
          size="md"
          locked={doc.is_locked}
          is_shared={(doc.share_count ?? 0) > 0}
        />
        <div className="min-w-0 flex-1">
          <p
            title={doc.original_filename}
            className="font-medium text-sm text-gray-900 dark:text-white truncate"
          >
            {doc.original_filename}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {doc.is_locked && (
              <Lock size={10} className="text-amber-500 shrink-0" />
            )}
            {(doc.share_count ?? 0) > 0 && (
              <Share2 size={10} className="text-blue-500 shrink-0" />
            )}
            {doc.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                {doc.category}
              </span>
            )}
            {doc.visibility && doc.visibility !== 'private' && (
              <VisibilityBadge visibility={doc.visibility} />
            )}
          </div>
        </div>
      </div>

      {/* Type */}
      <span className="hidden sm:table-cell text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide w-16 shrink-0">
        {doc.detected_file_type}
      </span>

      {/* Size */}
      <span className="hidden md:table-cell text-sm text-gray-500 dark:text-gray-400 w-20 shrink-0 text-right">
        {formatFileSize(doc.file_size)}
      </span>

      {/* Modified */}
      <span className="hidden lg:table-cell text-sm text-gray-400 dark:text-gray-500 w-28 shrink-0">
        {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
      </span>

      {/* Status */}
      <div className="w-28 shrink-0 hidden xl:block">
        <StatusBadge status={doc.processing_status} size="sm" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" data-no-select>
        <StarButton documentId={doc.id} isStarred={!!doc.is_starred} size="sm" />
        <button
          onClick={handleDownload}
          title="Download"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          <Download size={15} />
        </button>
        <button
          onClick={handleShare}
          title="Share"
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          <Share2 size={15} />
        </button>
        <button
          onClick={handleMore}
          title="More"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
}
