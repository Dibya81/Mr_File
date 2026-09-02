import { cn } from '../../utils/adminHelpers';

interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
  children?: React.ReactNode;
}

export default function StatusBadge({ status, className, dot }: StatusBadgeProps) {
  const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    queued: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    uploaded: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    operational: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    degraded: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    unavailable: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    unknown: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    not_monitored: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' },
    active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    revoked: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const colors = colorMap[status] || colorMap.unknown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        colors.bg,
        colors.text,
        className
      )}
    >
      {dot !== false && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
      )}
      {status.replace(/_/g, ' ')}
    </span>
  );
}
