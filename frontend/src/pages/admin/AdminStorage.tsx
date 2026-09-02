import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import StorageDonut from '../../components/admin/StorageDonut';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonCard } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatFileSize, formatDate } from '../../utils/adminHelpers';
import { HardDrive } from 'lucide-react';

const PALETTE = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500',
];

export default function AdminStorage() {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-storage-detail'],
    queryFn: () => adminApi.getStorage(),
    retry: 1,
  });

  const stats = data?.data;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.storage') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.storage')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isLoading}
        />

        {isError ? (
          <ErrorState
            message={t('admin.error.loadFailed', { resource: t('admin.section.storage') })}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive size={16} className="text-primary-600" />
                  <span className="text-sm text-gray-500">{t('admin.storage.total')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : formatFileSize(stats?.total_bytes ?? 0)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-3">{t('admin.storage.used')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : formatFileSize(stats?.used_bytes ?? 0)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-3">{t('admin.storage.available')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : formatFileSize((stats?.total_bytes ?? 0) - (stats?.used_bytes ?? 0))}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-3">{t('admin.storage.fileCount')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '—' : (stats?.file_count ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Usage bar */}
            {!isLoading && stats && stats.total_bytes > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">{t('admin.storage.used')}</span>
                  <span className="font-medium text-gray-900">
                    {((stats.used_bytes / stats.total_bytes) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.used_bytes / stats.total_bytes) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span>{formatFileSize(stats.used_bytes)}</span>
                  <span>{formatFileSize(stats.total_bytes)}</span>
                </div>
              </div>
            )}

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Storage by type */}
              <StorageDonut />

              {/* Storage by user */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('admin.storage.byUser')}</h3>
                {isLoading ? (
                  <SkeletonCard />
                ) : stats?.by_user && stats.by_user.length > 0 ? (
                  <div className="space-y-3">
                    {stats.by_user.map((row, i) => {
                      const pct = stats.total_bytes > 0 ? (row.bytes / stats.total_bytes) * 100 : 0;
                      return (
                        <div key={row.user_id}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{row.username}</span>
                            <span className="text-gray-500">
                              {formatFileSize(row.bytes)} · {row.count}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${PALETTE[i % PALETTE.length]} rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">—</p>
                )}
              </div>
            </div>

            {/* Largest files */}
            {!isLoading && stats?.largest_files && stats.largest_files.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">{t('admin.storage.largest')}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        {t('admin.documents.filename')}
                      </th>
                      <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        {t('admin.sharing.owner')}
                      </th>
                      <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        {t('admin.documents.size')}
                      </th>
                      <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        {t('admin.users.joined')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.largest_files.map((file, i) => (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.original_filename}
                          </p>
                          <p className="text-xs text-gray-500 uppercase">{file.detected_file_type}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{file.owner_username ?? '—'}</td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatFileSize(file.file_size)}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(file.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
