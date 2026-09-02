import { useState } from 'react';
import type { Document } from '@/types';
import FileRow from './FileRow';

interface FileListViewProps {
  documents: Document[];
  onSelect?: (doc: Document) => void;
  onContextMenu?: (doc: Document, e: React.MouseEvent) => void;
  onDownload?: (doc: Document) => void;
  onShare?: (doc: Document) => void;
  onMore?: (doc: Document) => void;
}

export default function FileListView({
  documents,
  onSelect,
  onContextMenu,
  onDownload,
  onShare,
  onMore,
}: FileListViewProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide select-none">
        <div className="flex-1 min-w-0">Name</div>
        <div className="hidden sm:table-cell w-16">Type</div>
        <div className="hidden md:table-cell w-20 text-right">Size</div>
        <div className="hidden lg:table-cell w-28">Modified</div>
        <div className="hidden xl:table-cell w-28">Status</div>
        <div className="w-20 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div>
        {documents.map((doc) => (
          <FileRow
            key={doc.id}
            document={doc}
            onSelect={() => onSelect?.(doc)}
            onOpenContextMenu={(e) => onContextMenu?.(doc, e)}
            onDownload={() => onDownload?.(doc)}
            onShare={() => onShare?.(doc)}
            onMore={() => onMore?.(doc)}
          />
        ))}
      </div>
    </div>
  );
}
