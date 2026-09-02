import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  Lock,
  Unlock,
  FolderInput,
  Trash2,
  Eye,
  FileText,
  Calendar,
  HardDrive,
  Tag,
  Users,
  File,
} from 'lucide-react';
import type { Document } from '@/types';
import { cn, formatFileSize, formatDate } from '@/utils/helpers';
import FileIcon from './FileIcon';
import StatusBadge from './StatusBadge';
import VisibilitySection from './VisibilitySection';

interface FileDetailsPanelProps {
  document: Document;
  onClose: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onLock?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        {children}
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white font-medium text-right max-w-[55%] truncate">
        {value ?? '—'}
      </span>
    </div>
  );
}

function MetadataSection({ metadata, fileType }: { metadata: Record<string, any>; fileType: string }) {
  const type = fileType.toLowerCase();

  const pdfMeta = metadata?.pdf ? [
    { key: 'Pages', value: metadata.pdf.pages ?? metadata.pdf.page_count },
    { key: 'Author', value: metadata.pdf.author },
    { key: 'Title', value: metadata.pdf.title },
    { key: 'Subject', value: metadata.pdf.subject },
    { key: 'Creator', value: metadata.pdf.creator },
    { key: 'Producer', value: metadata.pdf.producer },
    { key: 'Created', value: metadata.pdf.creation_date },
    { key: 'Modified', value: metadata.pdf.mod_date },
  ].filter(m => m.value) : [];

  const docxMeta = metadata?.docx ? [
    { key: 'Word Count', value: metadata.docx.word_count },
    { key: 'Paragraph Count', value: metadata.docx.paragraph_count },
    { key: 'Character Count', value: metadata.docx.character_count },
    { key: 'Author', value: metadata.docx.author || metadata.author },
    { key: 'Title', value: metadata.docx.title || metadata.title },
    { key: 'Subject', value: metadata.docx.subject },
    { key: 'Created', value: metadata.docx.created },
    { key: 'Modified', value: metadata.docx.modified },
  ].filter(m => m.value) : [];

  const xlsxMeta = metadata?.xlsx ? [
    { key: 'Sheet Count', value: metadata.xlsx.sheet_count },
    { key: 'Sheet Names', value: metadata.xlsx.sheet_names?.join(', ') },
    { key: 'Row Count', value: metadata.xlsx.row_count },
    { key: 'Author', value: metadata.xlsx.author || metadata.author },
    { key: 'Title', value: metadata.xlsx.title || metadata.title },
    { key: 'Created', value: metadata.xlsx.created },
    { key: 'Modified', value: metadata.xlsx.modified },
  ].filter(m => m.value) : [];

  const pptxMeta = metadata?.pptx ? [
    { key: 'Slide Count', value: metadata.pptx.slide_count },
    { key: 'Author', value: metadata.pptx.author || metadata.author },
    { key: 'Title', value: metadata.pptx.title || metadata.title },
    { key: 'Subject', value: metadata.pptx.subject },
    { key: 'Created', value: metadata.pptx.created },
    { key: 'Modified', value: metadata.pptx.modified },
  ].filter(m => m.value) : [];

  let rows: { key: string; value: string | number | undefined }[] = [];
  if (type === 'pdf') rows = pdfMeta;
  else if (type === 'docx') rows = docxMeta;
  else if (type === 'xlsx') rows = xlsxMeta;
  else if (type === 'pptx') rows = pptxMeta;

  if (rows.length === 0) {
    const flat = Object.entries(metadata ?? {})
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => ({ key: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: String(v) }));
    if (flat.length === 0) return null;
    rows = flat;
  }

  return (
    <div className="space-y-0">
      {rows.map(({ key, value }) => (
        <div key={key} className="flex items-start justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">{key}</span>
          <span className="text-sm text-gray-900 dark:text-white font-medium text-right max-w-[55%] truncate" title={String(value)}>
            {String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FileDetailsPanel({
  document: doc,
  onClose,
  onView,
  onDownload,
  onShare,
  onLock,
  onMove,
  onDelete,
}: FileDetailsPanelProps) {
  const type = doc.detected_file_type.toLowerCase();

  const panel = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed right-0 top-0 h-full z-50 overflow-y-auto',
          'w-full max-w-sm md:max-w-md',
          'bg-white dark:bg-[#0B0F19]',
          'border-l border-gray-200 dark:border-white/10',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-4" title={doc.original_filename}>
            {doc.original_filename}
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3 py-4">
            <FileIcon
              type={type}
              size="xl"
              locked={doc.is_locked}
              is_shared={(doc.share_count ?? 0) > 0}
            />
            <div className="flex items-center gap-2">
              <StatusBadge status={doc.processing_status} />
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Basic Info
            </h3>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-4">
              <InfoRow label="Type" value={doc.detected_file_type.toUpperCase()}>
                <FileText size={11} />
              </InfoRow>
              <InfoRow label="MIME" value={doc.detected_mime_type}>
                <File size={11} />
              </InfoRow>
              <InfoRow label="Size" value={formatFileSize(doc.file_size)}>
                <HardDrive size={11} />
              </InfoRow>
              <InfoRow label="Category" value={doc.category ?? undefined}>
                <Tag size={11} />
              </InfoRow>
              <InfoRow label="Status" value={undefined}>
                <Eye size={11} />
              </InfoRow>
              <div className="py-2">
                <StatusBadge status={doc.processing_status} size="sm" />
              </div>
              <InfoRow
                label={doc.is_locked ? 'Locked' : 'Unlocked'}
                value={doc.is_locked ? 'Yes' : 'No'}
              >
                {doc.is_locked ? <Lock size={11} /> : <Unlock size={11} />}
              </InfoRow>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Dates
            </h3>
            <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-4">
              <InfoRow label="Created" value={formatDate(doc.created_at)}>
                <Calendar size={11} />
              </InfoRow>
              <InfoRow label="Modified" value={formatDate(doc.updated_at)}>
                <Calendar size={11} />
              </InfoRow>
              {doc.processing_completed_at && (
                <InfoRow label="Processed" value={formatDate(doc.processing_completed_at)}>
                  <Calendar size={11} />
                </InfoRow>
              )}
            </div>
          </div>

          {/* Metadata */}
          {doc.metadata && Object.keys(doc.metadata).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Metadata
              </h3>
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-4">
                <MetadataSection metadata={doc.metadata} fileType={doc.detected_file_type} />
              </div>
            </div>
          )}

          {/* Visibility */}
          <VisibilitySection document={doc} />

          {/* Sharing */}
          {(doc.share_count ?? 0) > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Sharing
              </h3>
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-4">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
                    <Users size={13} />
                    {doc.share_count} shared
                  </span>
                  <button
                    onClick={onShare}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onView}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200',
                  'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                )}
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={onDownload}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200',
                  'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                )}
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={onShare}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200',
                  'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                )}
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={onLock}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200',
                  'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                )}
              >
                {doc.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                {doc.is_locked ? 'Unlock' : 'Lock'}
              </button>
              <button
                onClick={onMove}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border',
                  'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200',
                  'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
                )}
              >
                <FolderInput size={14} />
                Move
              </button>
            </div>
            <button
              onClick={onDelete}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition',
                'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
                'hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/50 dark:border-red-500/20'
              )}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );

  return createPortal(<AnimatePresence>{panel}</AnimatePresence>, window.document.body);
}
