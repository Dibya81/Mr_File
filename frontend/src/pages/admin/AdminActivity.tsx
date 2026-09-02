import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import TablePagination from '../../components/admin/TablePagination';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonRow } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../utils/adminHelpers';
import {
  Upload,
  Share2,
  Trash2,
  Lock,
  Unlock,
  Folder,
  User,
  FileText,
  Activity as ActivityIcon,
  Settings,
} from 'lucide-react';
import type { ActivityEvent } from '../../types';

const PER_PAGE = 30;

const ACTION_CONFIG: Record<string, { icon: any; bg: string; color: string }> = {
  upload: { icon: Upload, bg: 'bg-blue-50', color: 'text-blue-600' },
  delete: { icon: Trash2, bg: 'bg-red-50', color: 'text-red-600' },
  share_create: { icon: Share2, bg: 'bg-purple-50', color: 'text-purple-600' },
  share_revoke: { icon: Share2, bg: 'bg-gray-100', color: 'text-gray-500' },
  lock: { icon: Lock, bg: 'bg-amber-50', color: 'text-amber-600' },
  unlock: { icon: Unlock, bg: 'bg-green-50', color: 'text-green-600' },
  folder_create: { icon: Folder, bg: 'bg-amber-50', color: 'text-amber-600' },
  folder_delete: { icon: Folder, bg: 'bg-red-50', color: 'text-red-600' },
  user_create: { icon: User, bg: 'bg-cyan-50', color: 'text-cyan-600' },
  user_update: { icon: User, bg: 'bg-gray-50', color: 'text-gray-600' },
  document_create: { icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
  document_update: { icon: FileText, bg: 'bg-gray-50', color: 'text-gray-600' },
  role_change: { icon: Settings, bg: 'bg-purple-50', color: 'text-purple-600' },
};

function pickIcon(action: string, objectType?: string) {
  if (action in ACTION_CONFIG) return ACTION_CONFIG[action];
  if (objectType === 'document') return ACTION_CONFIG.document_create;
  if (objectType === 'folder') return ACTION_CONFIG.folder_create;
  if (objectType === 'share') return ACTION_CONFIG.share_create;
  if (objectType === 'user') return ACTION_CONFIG.user_create;
  return { icon: ActivityIcon, bg: 'bg-gray-50', color: 'text-gray-500' };
}

export default function AdminActivity() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-activity-all', page],
    queryFn: () => adminApi.getActivity(page, PER_PAGE),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
    retry: 1,
  });

  const items: ActivityEvent[] =
    (data?.data?.activity as ActivityEvent[] | undefined) ??
    (data?.data?.events as ActivityEvent[] | undefined) ??
    [];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.activity') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.activity')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.activity') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Object
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.security.time')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <SkeletonRow key={i} cols={4} />
                      ))
                    : items.map((event) => {
                        const config = pickIcon(event.action, event.object_type);
                        const Icon = config.icon;
                        return (
                          <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                                  <Icon size={13} className={config.color} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {event.actor_username}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {event.action.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                                  {event.object_type ?? '—'}
                                </span>
                                {event.object_label && (
                                  <span className="text-sm text-gray-900 truncate max-w-xs">
                                    {event.object_label}
                                  </span>
                                )}
                              </div>
                              {event.detail && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{event.detail}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {formatDateTime(event.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noActivity')} />
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
