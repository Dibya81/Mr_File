import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, HardDrive, Share2, Activity } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonCard } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatFileSize, formatDate, formatDateTime } from '../../utils/adminHelpers';
import type { UserDetail } from '../../types';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: !!id,
    retry: 1,
  });

  const user: UserDetail | undefined = data?.data;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.users'), href: '/admin/users' },
        { label: user?.username ?? '…' },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('admin.previous')}
        </button>

        {isError && (
          <ErrorState
            message={t('admin.error.loadFailed', { resource: t('admin.users.details') })}
            onRetry={() => refetch()}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SkeletonCard className="lg:col-span-2" />
            <SkeletonCard />
          </div>
        ) : user ? (
          <>
            {/* User profile card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                    <StatusBadge
                      status={user.is_active === false ? 'inactive' : 'active'}
                    />
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${
                        user.role === 'admin'
                          ? 'text-purple-700 bg-purple-50 border-purple-200'
                          : 'text-gray-600 bg-gray-50 border-gray-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {user.name && (
                    <p className="text-sm text-gray-500 mt-0.5">{user.name}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{t('admin.users.files')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {user.document_count ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{t('admin.users.storage')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {user.storage_bytes ? formatFileSize(user.storage_bytes) : '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{t('admin.users.sharedFiles')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {user.shared_count ?? '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{t('admin.users.joined')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Processing summary */}
            {user.processing_summary && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {t('admin.users.processingSummary')}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {user.processing_summary.completed}
                    </p>
                    <p className="text-xs text-green-700 mt-1">{t('admin.kpi.completed')}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">
                      {user.processing_summary.processing}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">{t('admin.processing.processing')}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">
                      {user.processing_summary.failed}
                    </p>
                    <p className="text-xs text-red-700 mt-1">{t('admin.kpi.failed')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent activity */}
            {user.recent_activity && user.recent_activity.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t('admin.users.recentActivity')}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {user.recent_activity.map((event) => (
                    <div key={event.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{event.action}</span>{' '}
                          {event.object_label && (
                            <span className="text-gray-600">{event.object_label}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{formatDateTime(event.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
