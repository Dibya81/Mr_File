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
import { formatFileSize, formatDate, getFileTypeColor } from '../../utils/adminHelpers';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import type { Document } from '../../types';

const PER_PAGE = 20;

export default function AdminDocuments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [lockedFilter, setLockedFilter] = useState('');

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    const timer = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(timer);
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-documents', page, debouncedSearch, typeFilter, lockedFilter],
    queryFn: () =>
      adminApi.getDocuments(page, PER_PAGE, {
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        locked: (lockedFilter as 'true' | 'false') || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
    },
  });

  const items: Document[] = (data?.data?.documents ?? data?.data?.items ?? []) as Document[];
  const total = data?.data?.total ?? 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.documents') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <PageHeader
          title={t('admin.section.documents')}
          subtitle={t('admin.subtitle')}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
        />

        <FilterBar
          searchValue={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
            const timer = setTimeout(() => setDebouncedSearch(v), 300);
            return () => clearTimeout(timer);
          }}
          searchPlaceholder={t('admin.documents.filename')}
          filters={
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} {t('admin.documents.type')}</option>
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
                <option value="pptx">PowerPoint</option>
                <option value="jpg">Image</option>
              </select>
              <select
                value={lockedFilter}
                onChange={(e) => { setLockedFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.all')} Lock</option>
                <option value="true">{t('admin.documents.locked')}</option>
                <option value="false">Unlocked</option>
              </select>
            </div>
          }
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isError ? (
            <ErrorState
              message={t('admin.error.loadFailed', { resource: t('admin.section.documents') })}
              onRetry={() => refetch()}
              className="py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.filename')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.type')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.category')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.size')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.documents.locked')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t('admin.users.joined')}
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
                    : items.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/admin/documents/${doc.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.original_filename}</p>
                              {doc.owner_username && (
                                <p className="text-xs text-gray-500">{doc.owner_username}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium uppercase ${getFileTypeColor(doc.detected_file_type)}`}>
                              {doc.detected_file_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {doc.category ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatFileSize(doc.file_size)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={doc.processing_status} />
                          </td>
                          <td className="px-4 py-3">
                            {doc.is_locked ? (
                              <Lock size={14} className="text-amber-600" />
                            ) : (
                              <Unlock size={14} className="text-gray-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(doc.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this document?')) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <EmptyState message={t('admin.empty.noDocuments')} />
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
