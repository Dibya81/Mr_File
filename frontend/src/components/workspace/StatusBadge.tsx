import type { Document } from '@/types';
import { cn } from '@/utils/helpers';

type Status = Document['processing_status'];

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  completed: {
    label: 'Completed',
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10 dark:bg-green-500/15',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-blue-500 animate-pulse',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  queued: {
    label: 'Queued',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
  },
  uploaded: {
    label: 'Uploaded',
    dot: 'bg-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-500/10 dark:bg-gray-500/15',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10 dark:bg-red-500/15',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.uploaded;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        cfg.bg,
        cfg.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('rounded-full shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
