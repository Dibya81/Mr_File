import { FileText, File, Image, Table2, Presentation, Lock, Share2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

export type FileSize = 'sm' | 'md' | 'lg' | 'xl';

interface FileIconProps {
  type: string;
  size?: FileSize;
  locked?: boolean;
  is_shared?: boolean;
}

const sizeMap: Record<FileSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

const containerSizeMap: Record<FileSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

const iconSizeMap: Record<FileSize, number> = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
};

const badgeSizeMap: Record<FileSize, string> = {
  sm: 'w-3 h-3 -top-0.5 -right-0.5',
  md: 'w-4 h-4 -top-0.5 -right-0.5',
  lg: 'w-5 h-5 -top-1 -right-1',
  xl: 'w-6 h-6 -top-1 -right-1',
};

const badgeIconSizeMap: Record<FileSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pdf: {
    icon: FileText,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  docx: {
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  xlsx: {
    icon: Table2,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },
  pptx: {
    icon: Presentation,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },
  jpg: {
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  jpeg: {
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  png: {
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  gif: {
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
};

export default function FileIcon({ type, size = 'md', locked, is_shared }: FileIconProps) {
  const config = typeConfig[type] ?? { icon: File, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' };
  const Icon = config.icon;

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={cn(
          'rounded-xl flex items-center justify-center',
          containerSizeMap[size],
          config.bg
        )}
      >
        <Icon size={iconSizeMap[size]} className={config.color} strokeWidth={1.75} />
      </div>

      {locked && (
        <div
          className={cn(
            'absolute rounded-full bg-amber-500 flex items-center justify-center shadow-sm',
            badgeSizeMap[size]
          )}
        >
          <Lock size={badgeIconSizeMap[size]} className="text-white" strokeWidth={2} />
        </div>
      )}

      {is_shared && !locked && (
        <div
          className={cn(
            'absolute rounded-full bg-blue-500 flex items-center justify-center shadow-sm',
            badgeSizeMap[size]
          )}
        >
          <Share2 size={badgeIconSizeMap[size]} className="text-white" strokeWidth={2} />
        </div>
      )}

      {is_shared && locked && (
        <div
          className={cn(
            'absolute rounded-full bg-blue-500 flex items-center justify-center shadow-sm',
            badgeSizeMap[size],
            'translate-x-2'
          )}
        >
          <Share2 size={badgeIconSizeMap[size]} className="text-white" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
