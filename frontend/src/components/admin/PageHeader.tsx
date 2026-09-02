import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../utils/adminHelpers';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  actions,
  className,
}: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {t('admin.refresh')}
          </button>
        )}
      </div>
    </div>
  );
}
