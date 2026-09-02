import type { Document } from '@/types';
import { cn, formatFileSize } from '@/utils/helpers';
import FileIcon from './FileIcon';
import StatusBadge from './StatusBadge';
import StarButton from './StarButton';
import VisibilityBadge from './VisibilityBadge';
import { formatDistanceToNow } from 'date-fns';

interface FileCardProps {
  document: Document;
  onSelect?: () => void;
  onOpenContextMenu?: (e: React.MouseEvent) => void;
}

export default function FileCard({ document: doc, onSelect, onOpenContextMenu }: FileCardProps) {
  const type = doc.detected_file_type.toLowerCase();

  return (
    <div
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContextMenu?.(e);
      }}
      className={cn(
        'group relative rounded-xl cursor-pointer select-none transition-all duration-200',
        'bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10',
        'hover:shadow-md hover:border-primary-200 dark:hover:border-primary-500/30',
        'hover:translate-y-[-1px]',
        doc.is_locked && 'ring-1 ring-amber-500/20'
      )}
    >
      {/* Locked amber tint overlay */}
      {doc.is_locked && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/[0.03] pointer-events-none z-0" />
      )}

      {/* Icon */}
      <div className="flex items-center justify-center pt-6 pb-3 relative z-10">
        <FileIcon
          type={type}
          size="xl"
          locked={doc.is_locked}
          is_shared={(doc.share_count ?? 0) > 0}
        />
      </div>

      {/* Content */}
      <div className="px-3 pb-3 relative z-10">
        <div className="flex items-start gap-1.5">
          <p
            title={doc.original_filename}
            className="flex-1 min-w-0 font-medium text-sm text-gray-900 dark:text-white truncate leading-tight"
          >
            {doc.original_filename}
          </p>
          <div className={cn('transition-opacity', doc.is_starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
            <StarButton documentId={doc.id} isStarred={!!doc.is_starred} size="sm" />
          </div>
        </div>

        {/* Type + Category row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
            {doc.detected_file_type}
          </span>
          {doc.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              {doc.category}
            </span>
          )}
          {doc.visibility && doc.visibility !== 'private' && (
            <VisibilityBadge visibility={doc.visibility} />
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2 gap-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {formatFileSize(doc.file_size)}
          </span>
          <StatusBadge status={doc.processing_status} size="sm" />
        </div>

        {/* Modified time */}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
