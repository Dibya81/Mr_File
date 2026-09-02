import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useToast, Toast } from '@/hooks/useToast';

const toastConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-green-400',
    bgClass: 'bg-green-500/10 border-green-500/20',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg',
        'bg-white/[0.03] border-white/10',
        config.bgClass,
        'min-w-[280px] max-w-[400px]'
      )}
    >
      <Icon size={18} className={config.iconClass} />

      <p className="flex-1 text-sm text-white/80 font-medium truncate">
        {toast.message}
      </p>

      <button
        onClick={onDismiss}
        className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex flex-col gap-2',
        'sm:top-4 sm:right-4',
        'max-md:top-4 max-md:left-4 max-md:right-4',
        'pointer-events-none'
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Convenience component for inline toast triggers
interface ToastTriggerProps {
  children: React.ReactNode;
  toastMessage: string;
  toastType?: 'success' | 'error' | 'info';
}

export function ToastTrigger({
  children,
  toastMessage,
  toastType = 'info',
}: ToastTriggerProps) {
  const { addToast } = useToast();

  return (
    <div
      onClick={() => addToast(toastMessage, toastType)}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
}
