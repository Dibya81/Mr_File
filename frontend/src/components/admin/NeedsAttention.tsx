import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatRelativeTime } from '../../utils/adminHelpers';
import EmptyState from './EmptyState';
import { SkeletonRow } from './SkeletonRow';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ProcessingJob } from '../../types';

export default function NeedsAttention() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-failed-jobs'],
    queryFn: () => adminApi.getProcessingJobs(1, 5, { status: 'failed' }),
    refetchInterval: 20000,
    retry: 1,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.retryProcessingJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-failed-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-jobs'] });
    },
  });

  const items: ProcessingJob[] =
    (data?.data?.jobs as ProcessingJob[] | undefined) ??
    (data?.data?.items as ProcessingJob[] | undefined) ??
    [];

  return (
    <div className="bg-white border border-red-100 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-red-100 flex items-center justify-between bg-red-50/30">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <h3 className="text-sm font-semibold text-gray-900">{t('admin.attention.title')}</h3>
          {items.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/admin/processing')}
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          {t('admin.view')} →
        </button>
      </div>

      {isLoading ? (
        <div className="p-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} cols={3} className="border-0" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message={t('admin.attention.empty')} />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((job) => (
            <div key={job.id} className="px-5 py-3 hover:bg-red-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job.document?.original_filename ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.owner_username && `${job.owner_username} · `}
                    {formatRelativeTime(job.created_at)}
                  </p>
                  {job.error_message && (
                    <p className="text-xs text-red-600 mt-1 truncate">{job.error_message}</p>
                  )}
                </div>
                <button
                  onClick={() => retryMutation.mutate(job.id)}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={12} />
                  {t('admin.retry')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
