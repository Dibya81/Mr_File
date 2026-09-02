import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ message, icon, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon ?? <Inbox size={24} />}
      </div>
      <p className="text-sm text-gray-500 max-w-xs">
        {message ?? t('admin.empty.noActivity')}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
