import { Folder, FolderOpen, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FolderTreeMockupProps {
  className?: string;
}

const treeData = [
  {
    id: 'reports',
    label: 'Reports',
    type: 'folder' as const,
    expanded: true,
    children: [
      {
        id: 'reports-2024',
        label: '2024',
        type: 'folder' as const,
        expanded: false,
        children: [
          { id: 'q1', label: 'Q1_report.pdf', type: 'file' as const, fileType: 'pdf' },
          { id: 'q2', label: 'Q2_report.pdf', type: 'file' as const, fileType: 'pdf' },
        ],
      },
      {
        id: 'reports-2025',
        label: '2025',
        type: 'folder' as const,
        expanded: false,
        children: [],
      },
    ],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    type: 'folder' as const,
    expanded: false,
    children: [],
  },
  {
    id: 'receipts',
    label: 'Receipts',
    type: 'folder' as const,
    expanded: false,
    children: [],
  },
];

interface TreeItemProps {
  id: string;
  label: string;
  type: 'folder' | 'file';
  fileType?: string;
  expanded?: boolean;
  children?: React.ReactNode;
  level?: number;
  isDragging?: boolean;
}

function TreeItem({ id, label, type, fileType = 'pdf', expanded, children, level = 0, isDragging }: TreeItemProps) {
  const paddingLeft = level * 5 + 12;

  if (type === 'file') {
    return (
      <div
        className={`flex items-center gap-2 py-1.5 pl-${paddingLeft} pr-3 ${isDragging ? 'opacity-30' : ''}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="w-4 h-4 flex-shrink-0">
          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{label}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 pr-3 cursor-default" style={{ paddingLeft: `${paddingLeft}px` }}>
        <ChevronRight
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        />
        {expanded ? (
          <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{label}</span>
        {children && (
          <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
            {Array.isArray(children) ? (Array.isArray(children) ? 0 : 0) : 0}
          </span>
        )}
      </div>
      {expanded && children && (
        <div>{children}</div>
      )}
    </div>
  );
}

export default function FolderTreeMockup({ className = '' }: FolderTreeMockupProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
        shadow-lg shadow-gray-200/30 dark:shadow-gray-950/30
        p-5 w-full max-w-sm mx-auto
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
            <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">My Files</span>
        </div>
        <div className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          3 folders
        </div>
      </div>

      {/* Tree */}
      <div className="space-y-0.5">
        {/* Reports — expanded */}
        <div>
          <div className="flex items-center gap-2 py-1.5 pr-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
            <ChevronRight className="w-3.5 h-3.5 text-blue-400 dark:text-blue-500 rotate-90 ml-3 flex-shrink-0" />
            <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Reports</span>
            <span className="ml-auto text-[10px] text-blue-400 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
              2 subfolders
            </span>
          </div>

          {/* 2024 folder */}
          <div className="mt-1">
            <div className="flex items-center gap-2 py-1.5 pr-3" style={{ paddingLeft: '32px' }}>
              <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <Folder className="w-3.5 h-3.5 text-blue-400 dark:text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">2024</span>
            </div>

            {/* Files in 2024 */}
            <div className="flex items-center gap-2 py-1 pr-3" style={{ paddingLeft: '52px' }}>
              <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Q1_report.pdf</span>
            </div>
            <div className="flex items-center gap-2 py-1 pr-3" style={{ paddingLeft: '52px' }}>
              <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Q2_report.pdf</span>
            </div>
          </div>

          {/* 2025 folder — drag target */}
          <div className="mt-1">
            <div className="flex items-center gap-2 py-1.5 pr-3 relative" style={{ paddingLeft: '32px' }}>
              <ChevronRight className="w-3 h-3 text-blue-400 dark:text-blue-500 rotate-90 flex-shrink-0" />
              <FolderOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">2025</span>

              {/* Dragged file being dropped here */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute -top-3 left-8 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 shadow-lg z-10"
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Q3_report.pdf</span>
              </motion.div>
            </div>

            {/* Drop zone indicator */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 28 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mx-4 mt-1 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg flex items-center justify-center"
              style={{ marginLeft: '36px' }}
            >
              <span className="text-[10px] text-blue-400 dark:text-blue-500">Drop here</span>
            </motion.div>
          </div>
        </div>

        {/* Contracts */}
        <div className="flex items-center gap-2 py-1.5 pr-3 mt-1" style={{ paddingLeft: '12px' }}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <Folder className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Contracts</span>
        </div>

        {/* Receipts */}
        <div className="flex items-center gap-2 py-1.5 pr-3" style={{ paddingLeft: '12px' }}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <Folder className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Receipts</span>
        </div>
      </div>

      {/* Ghost/placeholder showing original position */}
      <div className="mt-2 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 py-1 opacity-30" style={{ paddingLeft: '52px' }}>
          <div className="w-3.5 h-3.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Q3_report.pdf</span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 ml-1">(original)</span>
        </div>
      </div>
    </div>
  );
}
