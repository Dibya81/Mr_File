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
import { formatDate } from '../../utils/adminHelpers';
import type { Share } from '../../types';

const PER_PAGE = 20;

export default function AdminSharing() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    const timer = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(timer);
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-sharing', page, debouncedSearch, statusFilter],
    queryFn: () =>
      adminApi.getSharing(page, PER_PAGE, {
        search: debouncedSearch || undefined,
        status: (statusFilter as 'active' | 'revoked') || undefined,
      }),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const items: Share[] = (data?.data?.shares ?? data?.data?.items ?? []) as Share[];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.sharing') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.sharing')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        <FilterBar
          searchValue={search}
          onSearch={handleSearch}
          searchPlaceholder={t('admin.sharing.sharedWith')}
          filters={
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} {t('admin.sharing.status')}</option>
                <option value="active">{t('admin.sharing.active')}</option>
                <option value="revoked">{t('admin.sharing.revoked')}</option>
              </select>
            </div>
          }
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.sharing') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.file')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.owner')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.sharedWith')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.permission')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.sharing.created')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <SkeletonRow key={i} cols={6} />
                      ))
                    : items.map((share) => (
                        <tr key={share.share_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {share.document?.original_filename ?? '—'}
                              </p>
                              {share.document?.detected_file_type && (
                                <p className="text-xs text-gray-500 uppercase">
                                  {share.document.detected_file_type}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {share.shared_by_username}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {share.shared_with_username}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize">
                              {share.permission}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={share.revoked_at ? 'revoked' : 'active'} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(share.created_at)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noShares')} />
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
