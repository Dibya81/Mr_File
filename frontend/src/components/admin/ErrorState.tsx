import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className ?? ''}`}>
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 text-red-500">
        <AlertCircle size={22} />
      </div>
      <p className="text-sm text-gray-600 max-w-sm">
        {message ?? t('admin.error.generic')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <RefreshCw size={14} />
          {t('admin.error.retry')}
        </button>
      )}
    </div>
  );
}
