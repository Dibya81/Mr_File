import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Activity, Database, HardDrive, Cpu, Lock, Server } from 'lucide-react';
import { adminApi } from '../../api/admin';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { SkeletonCard } from './SkeletonRow';
import type { SystemHealth as SystemHealthType } from '../../types';

const HEALTH_ICONS = {
  api: Server,
  database: Database,
  storage: HardDrive,
  processing: Cpu,
  authentication: Lock,
} as const;

const HEALTH_KEYS: Array<keyof SystemHealthType> = [
  'api',
  'database',
  'storage',
  'processing',
  'authentication',
];

export default function SystemHealth() {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: 30000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="h-4 w-1/3 rounded skeleton-shimmer mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {HEALTH_KEYS.map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.health.title')}</h3>
        <p className="text-sm text-gray-500">—</p>
      </div>
    );
  }

  const health = data?.data;

  // Empty / not configured: backend may not have the route yet.
  if (!health) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.health.title')}</h3>
        <EmptyState message={t('admin.error.loadFailed', { resource: t('admin.health.title') })} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">{t('admin.health.title')}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {HEALTH_KEYS.map((key) => {
          const Icon = HEALTH_ICONS[key];
          const status = health[key] ?? 'unknown';
          return (
            <div
              key={key}
              className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  {t(`admin.health.${key}`)}
                </span>
              </div>
              <StatusBadge status={status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
