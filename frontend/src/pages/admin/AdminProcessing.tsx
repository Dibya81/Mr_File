import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import FilterBar from '../../components/admin/FilterBar';
import TablePagination from '../../components/admin/TablePagination';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonRow } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatDuration, formatDate, formatDateTime } from '../../utils/adminHelpers';
import { RefreshCw } from 'lucide-react';
import type { ProcessingJob } from '../../types';

const PER_PAGE = 20;

export default function AdminProcessing() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-processing', page, statusFilter, typeFilter],
    queryFn: () =>
      adminApi.getProcessingJobs(page, PER_PAGE, {
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.retryProcessingJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-processing'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const items: ProcessingJob[] = (data?.data?.jobs ?? data?.data?.items ?? []) as ProcessingJob[];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.processing') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.processing')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        <FilterBar
          searchValue=""
          onSearch={() => {}}
          filters={
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} {t('admin.processing.filterStatus')}</option>
                <option value="queued">{t('admin.processing.queued')}</option>
                <option value="processing">{t('admin.processing.processing')}</option>
                <option value="completed">{t('admin.processing.completedStatus')}</option>
                <option value="failed">{t('admin.processing.failedStatus')}</option>
              </select>
              <input
                type="text"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                placeholder="Job type"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          }
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.processing') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.document')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.type')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.stage')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.duration')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.processing.started')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <SkeletonRow key={i} cols={7} />
                      ))
                    : items.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {job.document?.original_filename ?? '—'}
                              </p>
                              {job.owner_username && (
                                <p className="text-xs text-gray-500">{job.owner_username}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {job.job_type}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={job.stage ?? job.status} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={job.status} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDuration(job.duration_ms)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {job.started_at ? formatDate(job.started_at) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {job.status === 'failed' && (
                              <button
                                onClick={() => retryMutation.mutate(job.id)}
                                disabled={retryMutation.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <RefreshCw size={12} />
                                {t('admin.retry')}
                              </button>
                            )}
                            {job.error_message && (
                              <p className="text-xs text-red-600 mt-1 truncate max-w-xs">
                                {job.error_message}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noJobs')} />
          )}

          <TablePagination
            page={page}
            perPage={PER_PAGE}
            total={total}
            onPageChange={setPage}
            loading={isFetching}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
