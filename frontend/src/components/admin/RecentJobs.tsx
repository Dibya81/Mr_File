import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatRelativeTime, formatDuration } from '../../utils/adminHelpers';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import { SkeletonRow } from './SkeletonRow';
import { Cpu, RefreshCw } from 'lucide-react';
import type { ProcessingJob } from '../../types';

interface RecentJobsProps {
  limit?: number;
  showHeader?: boolean;
}

export default function RecentJobs({ limit = 6, showHeader = true }: RecentJobsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-recent-jobs', limit],
    queryFn: () => adminApi.getProcessingJobs(1, limit),
    refetchInterval: 15000,
    retry: 1,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.retryProcessingJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recent-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const items: ProcessingJob[] =
    (data?.data?.jobs as ProcessingJob[] | undefined) ??
    (data?.data?.items as ProcessingJob[] | undefined) ??
    [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {showHeader && (
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">{t('admin.jobs.title')}</h3>
          </div>
          <button
            onClick={() => navigate('/admin/processing')}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            {t('admin.view')} →
          </button>
        </div>
      )}

      {isLoading ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                {t('admin.processing.document')}
              </th>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                {t('admin.processing.status')}
              </th>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                {t('admin.processing.duration')}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: limit }).map((_, i) => (
              <SkeletonRow key={i} cols={3} />
            ))}
          </tbody>
        </table>
      ) : items.length === 0 ? (
        <EmptyState message={t('admin.jobs.empty')} />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((job) => (
            <div key={job.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job.document?.original_filename ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.owner_username && `${job.owner_username} · `}
                    {formatRelativeTime(job.created_at)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
                <span className="text-xs text-gray-500 w-16 text-right hidden sm:block">
                  {formatDuration(job.duration_ms)}
                </span>
                {job.status === 'failed' && (
                  <button
                    onClick={() => retryMutation.mutate(job.id)}
                    disabled={retryMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    title={t('admin.retry')}
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
              {job.error_message && (
                <p className="text-xs text-red-600 mt-1 truncate">{job.error_message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
