import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface StatusPillProps {
  className?: string;
}

export default function StatusPill({ className }: StatusPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
        // Dark mode
        'dark:text-green-400 dark:bg-green-400/20 dark:border dark:border-green-400/40',
        // Light mode
        'text-green-600 bg-green-50 border border-green-200',
        className
      )}
    >
      {/* Pulsing dot */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'w-2 h-2 rounded-full',
          'dark:bg-green-400 bg-green-500'
        )}
      />
      <span>v2.0 Live</span>
    </div>
  );
}
