import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock, Unlock, Hash, FolderOpen } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import ErrorState from '../../components/admin/ErrorState';
import { SkeletonCard } from '../../components/admin/SkeletonRow';
import { adminApi } from '../../api/admin';
import {
  formatFileSize,
  formatDate,
  formatDateTime,
  getFileTypeColor,
} from '../../utils/adminHelpers';
import type { Document } from '../../types';

export default function AdminDocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-document', id],
    queryFn: () => adminApi.getDocument(id!),
    enabled: !!id,
    retry: 1,
  });

  const doc: Document | undefined = data?.data;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main'), href: '/admin' },
        { label: t('admin.section.documents'), href: '/admin/documents' },
        { label: doc?.original_filename ?? '…' },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('admin.previous')}
        </button>

        {isError && (
          <ErrorState
            message={t('admin.error.loadFailed', { resource: t('admin.documents.details') })}
            onRetry={() => refetch()}
          />
        )}

        {isLoading ? (
          <SkeletonCard className="max-w-2xl" />
        ) : doc ? (
          <>
            {/* File card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className={`px-3 py-2 rounded-lg text-sm font-bold uppercase flex-shrink-0 ${getFileTypeColor(doc.detected_file_type)}`}>
                  {doc.detected_file_type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 break-all">{doc.original_filename}</h2>
                    <StatusBadge status={doc.processing_status} />
                    {doc.is_locked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                        <Lock size={10} /> {t('admin.documents.locked')}
                      </span>
                    ) : null}
                  </div>
                  {doc.title && (
                    <p className="text-sm text-gray-500 mt-1">{doc.title}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">{doc.detected_mime_type}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{t('admin.documents.size')}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatFileSize(doc.file_size)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{t('admin.documents.category')}</p>
                  <p className="text-sm font-semibold text-gray-900">{doc.category ?? '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{t('admin.users.joined')}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(doc.created_at)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{t('admin.documents.status')}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{doc.processing_status}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('admin.documents.details')}</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">{t('admin.documents.mimeType')}</dt>
                  <dd className="text-sm text-gray-900 font-mono break-all">{doc.detected_mime_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">{t('admin.documents.fileType')}</dt>
                  <dd className="text-sm text-gray-900">{doc.detected_file_type}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Hash size={10} /> {t('admin.documents.hash')}
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono break-all">{doc.file_hash}</dd>
                </div>
                {doc.storage_path && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-gray-500 flex items-center gap-1.5">
                      <FolderOpen size={10} /> {t('admin.documents.storagePath')}
                    </dt>
                    <dd className="text-sm text-gray-900 font-mono break-all">{doc.storage_path}</dd>
                  </div>
                )}
                {doc.author && (
                  <div>
                    <dt className="text-xs text-gray-500">{t('admin.extraction.author')}</dt>
                    <dd className="text-sm text-gray-900">{doc.author}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500">{t('admin.documents.uploaded')}</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(doc.created_at)}</dd>
                </div>
                {doc.processing_error && (
                  <div className="sm:col-span-2 p-3 bg-red-50 rounded-lg border border-red-100">
                    <dt className="text-xs text-red-600 font-medium mb-1">{t('admin.processing.error')}</dt>
                    <dd className="text-sm text-red-700">{doc.processing_error}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Metadata */}
            {doc.metadata && Object.keys(doc.metadata).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('admin.documents.metadata')}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(doc.metadata).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <dt className="text-xs text-gray-500 mb-1">{key}</dt>
                      <dd className="text-sm text-gray-900 break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
