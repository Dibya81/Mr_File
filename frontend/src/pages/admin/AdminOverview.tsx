import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, HardDrive, Cpu, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import SystemHealth from '../../components/admin/SystemHealth';
import ProcessingPipeline from '../../components/admin/ProcessingPipeline';
import StorageDonut from '../../components/admin/StorageDonut';
import ActivityFeed from '../../components/admin/ActivityFeed';
import RecentJobs from '../../components/admin/RecentJobs';
import NeedsAttention from '../../components/admin/NeedsAttention';
import ErrorState from '../../components/admin/ErrorState';
import { adminApi } from '../../api/admin';
import { formatFileSize, formatNumber } from '../../utils/adminHelpers';

export default function AdminOverview() {
  const { t } = useTranslation();

  const { data: statsData, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 30000,
    retry: 1,
  });

  const stats = statsData?.data;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('admin.section.main') },
        { label: t('admin.section.overview') },
      ]}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('admin.subtitle')}</p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <AdminKpiCard
            label={t('admin.kpi.totalUsers')}
            value={formatNumber(stats?.total_users ?? 0)}
            icon={<Users size={18} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <AdminKpiCard
            label={t('admin.kpi.totalDocuments')}
            value={formatNumber(stats?.total_documents ?? 0)}
            icon={<FileText size={18} />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <AdminKpiCard
            label={t('admin.kpi.storageUsed')}
            value={formatFileSize(stats?.total_storage_bytes ?? 0)}
            icon={<HardDrive size={18} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <AdminKpiCard
            label={t('admin.kpi.totalJobs')}
            value={formatNumber(stats?.total_processing_jobs ?? 0)}
            icon={<Cpu size={18} />}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
          <AdminKpiCard
            label={t('admin.kpi.completed')}
            value={formatNumber(stats?.completed_jobs ?? 0)}
            icon={<CheckCircle size={18} />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <AdminKpiCard
            label={t('admin.kpi.failed')}
            value={formatNumber(stats?.failed_jobs ?? 0)}
            icon={<AlertTriangle size={18} />}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
        </div>

        {/* System health + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SystemHealth />
          <ProcessingPipeline />
        </div>

        {/* Main 3-col: Activity + Recent Jobs + Needs Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <ActivityFeed limit={8} />
          <div className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <RecentJobs limit={5} />
            <NeedsAttention />
          </div>
        </div>

        {/* Storage breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <StorageDonut />
          </div>
          {/* Quick stats panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900">{t('admin.kpi.active24h')}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('admin.kpi.totalUsers')}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(stats?.active_users_24h ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('admin.kpi.recentUploads')}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(stats?.recent_uploads ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('admin.processing.avgTime')}</span>
                <span className="text-sm font-semibold text-gray-900">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
