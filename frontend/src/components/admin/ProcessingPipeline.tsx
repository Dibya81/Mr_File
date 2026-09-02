import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Cpu } from 'lucide-react';
import { SkeletonCard } from './SkeletonRow';

const STAGE_KEYS = [
  { key: 'uploaded', tKey: 'pipeline.uploaded' },
  { key: 'detecting', tKey: 'pipeline.detecting' },
  { key: 'extracting', tKey: 'pipeline.extracting' },
  { key: 'classifying', tKey: 'pipeline.classifying' },
  { key: 'storing', tKey: 'pipeline.storing' },
] as const;

const FINAL_KEYS = [
  { key: 'completed', tKey: 'pipeline.completed' },
  { key: 'failed', tKey: 'pipeline.failed' },
] as const;

interface PipelineData {
  by_stage?: Record<string, number>;
}

export default function ProcessingPipeline() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pipeline'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 30000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="h-4 w-1/3 rounded skeleton-shimmer mb-4" />
        <SkeletonCard className="border-0 p-0" />
      </div>
    );
  }

  // Stats endpoint typically includes jobs but not always stages. We extract if present.
  const stages = (data?.data as PipelineData | undefined)?.by_stage;
  const completed = data?.data?.completed_jobs ?? 0;
  const failed = data?.data?.failed_jobs ?? 0;
  const total = data?.data?.total_processing_jobs ?? 0;

  // If no per-stage data, we render a single horizontal progress bar showing completed/failed.
  const hasStages = stages && Object.keys(stages).length > 0;

  if (!hasStages && total === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">{t('admin.pipeline.title')}</h3>
        </div>
        <p className="text-sm text-gray-500">—</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">{t('admin.pipeline.title')}</h3>
        </div>
        <span className="text-xs text-gray-500">
          {t('admin.kpi.totalJobs')}: {total}
        </span>
      </div>

      {/* Pipeline stages as horizontal flow */}
      {hasStages && (
        <div className="flex flex-wrap items-stretch gap-2">
          {STAGE_KEYS.map(({ key, tKey }, idx) => {
            const count = stages![key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-2 flex-1 min-w-[110px]">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{t(`admin.${tKey}`)}</p>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </div>
                {idx < STAGE_KEYS.length - 1 && (
                  <div className="hidden sm:block w-2 h-0.5 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Final states */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 mb-1">{t('admin.pipeline.completed')}</p>
          <p className="text-lg font-bold text-green-700">{completed}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700 mb-1">{t('admin.pipeline.failed')}</p>
          <p className="text-lg font-bold text-red-700">{failed}</p>
        </div>
      </div>
    </div>
  );
}
