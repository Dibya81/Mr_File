import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Clock,
  Circle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

type StatusType = 'completed' | 'processing' | 'queued' | 'uploaded' | 'failed';

interface ProcessingStatusProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1',
  lg: 'text-sm px-3 py-1.5 gap-1.5',
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 14,
};

const statusConfig: Record<
  StatusType,
  {
    icon: React.ReactNode;
    label: string;
    containerClass: string;
    textClass: string;
  }
> = {
  completed: {
    icon: <CheckCircle2 size={12} />,
    label: 'Completed',
    containerClass: 'bg-green-500/10 border-green-500/20',
    textClass: 'text-green-400',
  },
  processing: {
    icon: (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={12} />
      </motion.div>
    ),
    label: 'Processing',
    containerClass: 'bg-blue-500/10 border-blue-500/20',
    textClass: 'text-blue-400',
  },
  queued: {
    icon: <Clock size={12} />,
    label: 'Queued',
    containerClass: 'bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-400',
  },
  uploaded: {
    icon: <Circle size={12} />,
    label: 'Uploaded',
    containerClass: 'bg-white/5 border-white/10',
    textClass: 'text-white/50',
  },
  failed: {
    icon: <AlertCircle size={12} />,
    label: 'Failed',
    containerClass: 'bg-red-500/10 border-red-500/20',
    textClass: 'text-red-400',
  },
};

// Map processing_status values to our status types
function mapStatus(status: string): StatusType {
  const statusLower = status.toLowerCase();

  if (
    statusLower === 'completed' ||
    statusLower === 'ready' ||
    statusLower === 'success'
  ) {
    return 'completed';
  }

  if (
    statusLower === 'processing' ||
    statusLower === 'detecting' ||
    statusLower === 'extracting' ||
    statusLower === 'classifying' ||
    statusLower === 'analyzing'
  ) {
    return 'processing';
  }

  if (statusLower === 'queued' || statusLower === 'pending') {
    return 'queued';
  }

  if (statusLower === 'uploaded') {
    return 'uploaded';
  }

  if (statusLower === 'failed' || statusLower === 'error') {
    return 'failed';
  }

  // Default to uploaded for unknown statuses
  return 'uploaded';
}

function getLabel(status: string): string {
  const statusLower = status.toLowerCase();

  // Preserve the original status text for display
  const displayNames: Record<string, string> = {
    completed: 'Completed',
    ready: 'Ready',
    success: 'Success',
    processing: 'Processing',
    detecting: 'Detecting',
    extracting: 'Extracting',
    classifying: 'Classifying',
    analyzing: 'Analyzing',
    queued: 'Queued',
    pending: 'Pending',
    uploaded: 'Uploaded',
    failed: 'Failed',
    error: 'Error',
  };

  return displayNames[statusLower] || status;
}

export function ProcessingStatus({
  status,
  size = 'md',
  showIcon = true,
  className,
}: ProcessingStatusProps) {
  const mappedStatus = mapStatus(status);
  const config = statusConfig[mappedStatus];
  const label = getLabel(status);

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        sizeClasses[size],
        config.containerClass,
        className
      )}
    >
      {showIcon && (
        <span className={cn('flex-shrink-0', config.textClass)}>
          {mappedStatus === 'processing' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Loader2 size={iconSizes[size]} />
            </motion.div>
          ) : (
            config.icon
          )}
        </span>
      )}
      <span className={cn('whitespace-nowrap', config.textClass)}>
        {label}
      </span>
    </span>
  );
}

// Convenience component for document list items
export function DocumentStatusBadge({
  processingStatus,
  size = 'sm',
}: {
  processingStatus?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!processingStatus) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          'bg-white/5 border border-white/10 text-white/40'
        )}
      >
        <Circle size={10} />
        Unknown
      </span>
    );
  }

  return <ProcessingStatus status={processingStatus} size={size} />;
}

// Status dot for inline status indicators
export function StatusDot({
  status,
  size = 'md',
}: {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const mappedStatus = mapStatus(status);
  const config = statusConfig[mappedStatus];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotColors: Record<StatusType, string> = {
    completed: 'bg-green-400',
    processing: 'bg-blue-400',
    queued: 'bg-amber-400',
    uploaded: 'bg-white/40',
    failed: 'bg-red-400',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        dotSizes[size],
        dotColors[mappedStatus],
        mappedStatus === 'processing' && 'animate-pulse'
      )}
    />
  );
}
