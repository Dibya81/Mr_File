import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import FilterBar from '../../components/admin/FilterBar';
import TablePagination from '../../components/admin/TablePagination';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonRow } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import { formatFileSize, formatDate } from '../../utils/adminHelpers';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import type { User } from '../../types';

const PER_PAGE = 20;

export default function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Debounce search
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    const timer = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(timer);
  };

  const filters = {
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-users', page, filters],
    queryFn: () =>
      adminApi.getUsers(page, PER_PAGE, {
        search: debouncedSearch || undefined,
        role: (roleFilter as 'admin' | 'user') || undefined,
        status: (statusFilter as 'active' | 'inactive') || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'user' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const items: User[] = (data?.data?.users ?? data?.data?.items ?? []) as User[];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.users') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.users')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
            const timer = setTimeout(() => setDebouncedSearch(v), 300);
            return () => clearTimeout(timer);
          }}
          searchPlaceholder={t('admin.users.username')}
          filters={
            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} {t('admin.users.role')}</option>
                <option value="admin">{t('admin.section.main')}</option>
                <option value="user">{t('admin.section.users')}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} {t('admin.users.status')}</option>
                <option value="active">{t('admin.users.active')}</option>
                <option value="inactive">{t('admin.users.inactive')}</option>
              </select>
            </div>
          }
        />

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.users') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.username')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.email')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.role')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.files')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.storage')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.joined')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <SkeletonRow key={i} cols={8} />
                      ))
                    : items.length === 0
                    ? null
                    : items.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.username}</p>
                              {user.name && (
                                <p className="text-xs text-gray-500">{user.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={user.role === 'admin' ? 'active' : 'inactive'}
                              dot={false}
                              className={
                                user.role === 'admin'
                                  ? 'text-purple-700 bg-purple-50 border border-purple-200'
                                  : 'text-gray-600 bg-gray-50 border border-gray-200'
                              }
                            >
                              <span className="capitalize">{user.role}</span>
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.document_count ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.storage_bytes ? formatFileSize(user.storage_bytes) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={user.is_active === false ? 'revoked' : 'active'}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newRole = user.role === 'admin' ? 'user' : 'admin';
                                updateRoleMutation.mutate({ id: user.id, role: newRole });
                              }}
                              disabled={updateRoleMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            >
                              {user.role === 'admin' ? (
                                <><ShieldOff size={12} /> Remove</>
                              ) : (
                                <><ShieldCheck size={12} /> Make admin</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noUsers')} />
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
