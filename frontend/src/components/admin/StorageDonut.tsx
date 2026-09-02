import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatFileSize } from '../../utils/adminHelpers';
import EmptyState from './EmptyState';
import { SkeletonCard } from './SkeletonRow';

interface FileTypeStat {
  type: string;
  bytes: number;
  count: number;
}

const PALETTE = [
  { bg: 'bg-blue-500', text: 'text-blue-500', soft: 'bg-blue-100' },
  { bg: 'bg-green-500', text: 'text-green-500', soft: 'bg-green-100' },
  { bg: 'bg-purple-500', text: 'text-purple-500', soft: 'bg-purple-100' },
  { bg: 'bg-orange-500', text: 'text-orange-500', soft: 'bg-orange-100' },
  { bg: 'bg-pink-500', text: 'text-pink-500', soft: 'bg-pink-100' },
  { bg: 'bg-amber-500', text: 'text-amber-500', soft: 'bg-amber-100' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', soft: 'bg-cyan-100' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500', soft: 'bg-indigo-100' },
];

export default function StorageDonut() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-storage'],
    queryFn: () => adminApi.getStorage(),
    retry: 1,
  });

  if (isLoading) {
    return <SkeletonCard />;
  }

  const byType: FileTypeStat[] = data?.data?.by_type ?? [];
  const total = byType.reduce((sum, x) => sum + x.bytes, 0);

  if (byType.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.fileTypes.title')}</h3>
        <EmptyState message={t('admin.empty.noDocuments')} />
      </div>
    );
  }

  // Sort by bytes desc, top 8
  const sorted = [...byType].sort((a, b) => b.bytes - a.bytes).slice(0, 8);
  const othersTotal = byType.slice(8).reduce((s, x) => s + x.bytes, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('admin.fileTypes.title')}</h3>

      <div className="space-y-3">
        {sorted.map((row, i) => {
          const pct = total > 0 ? (row.bytes / total) * 100 : 0;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={row.type}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${color.bg}`} />
                  <span className="font-medium text-gray-700 uppercase">{row.type}</span>
                  <span className="text-gray-400">· {row.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{formatFileSize(row.bytes)}</span>
                  <span className="font-medium text-gray-700 w-10 text-right">{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {othersTotal > 0 && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="text-gray-500">Other</span>
            <span className="text-gray-500">{formatFileSize(othersTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
