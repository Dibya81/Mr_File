import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import FilterBar from '../../components/admin/FilterBar';
import TablePagination from '../../components/admin/TablePagination';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonRow } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../utils/adminHelpers';
import type { SecurityEvent } from '../../types';

const PER_PAGE = 20;

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export default function AdminSecurity() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-security', page],
    queryFn: () => adminApi.getSecurity(page, PER_PAGE),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const items: SecurityEvent[] = (data?.data?.events ?? data?.data?.items ?? []) as SecurityEvent[];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.security') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.security')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.security') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.severity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.type')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.actor')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.ip')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('admin.security.detail')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.time')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <SkeletonRow key={i} cols={6} />
                      ))
                    : items.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <StatusBadge status={event.severity} dot={true} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 font-mono">
                              {event.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {event.username ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                            {event.ip_address ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {event.detail}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDateTime(event.created_at)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noEvents')} />
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
