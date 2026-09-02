import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatRelativeTime } from '../../utils/adminHelpers';
import EmptyState from './EmptyState';
import { SkeletonCard } from './SkeletonRow';
import {
  Upload,
  Share2,
  Trash2,
  Lock,
  Unlock,
  Folder,
  User,
  FileText,
  Activity,
} from 'lucide-react';
import type { ActivityEvent } from '../../types';

const ACTION_ICONS: Record<string, { icon: any; bg: string; color: string }> = {
  upload: { icon: Upload, bg: 'bg-blue-50', color: 'text-blue-600' },
  delete: { icon: Trash2, bg: 'bg-red-50', color: 'text-red-600' },
  share_create: { icon: Share2, bg: 'bg-purple-50', color: 'text-purple-600' },
  share_revoke: { icon: Share2, bg: 'bg-gray-100', color: 'text-gray-500' },
  lock: { icon: Lock, bg: 'bg-amber-50', color: 'text-amber-600' },
  unlock: { icon: Unlock, bg: 'bg-green-50', color: 'text-green-600' },
  folder_create: { icon: Folder, bg: 'bg-amber-50', color: 'text-amber-600' },
  user_create: { icon: User, bg: 'bg-cyan-50', color: 'text-cyan-600' },
  document_create: { icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
  document_update: { icon: FileText, bg: 'bg-gray-50', color: 'text-gray-600' },
};

function pickIcon(action: string, objectType?: string) {
  if (action in ACTION_ICONS) return ACTION_ICONS[action];
  if (objectType === 'document') return ACTION_ICONS.document_create;
  if (objectType === 'share') return ACTION_ICONS.share_create;
  if (objectType === 'folder') return ACTION_ICONS.folder_create;
  if (objectType === 'user') return ACTION_ICONS.user_create;
  return { icon: Activity, bg: 'bg-gray-50', color: 'text-gray-500' };
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

export default function ActivityFeed({ limit = 8, showHeader = true }: ActivityFeedProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity', limit],
    queryFn: () => adminApi.getActivity(1, limit),
    refetchInterval: 15000,
    retry: 1,
  });

  const items: ActivityEvent[] =
    (data?.data?.activity as ActivityEvent[] | undefined) ??
    (data?.data?.events as ActivityEvent[] | undefined) ??
    [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {showHeader && (
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">{t('admin.activity.title')}</h3>
          </div>
          <button
            onClick={() => navigate('/admin/activity')}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            {t('admin.view')} →
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded skeleton-shimmer" />
                <div className="h-3 w-1/2 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message={t('admin.activity.empty')} />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((event) => {
            const config = pickIcon(event.action, event.object_type);
            const Icon = config.icon;
            return (
              <div key={event.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{event.actor_username}</span>{' '}
                      <span className="text-gray-600">{event.action.replace(/_/g, ' ')}</span>
                      {event.object_label && (
                        <>
                          {' '}
                          <span className="font-medium">{event.object_label}</span>
                        </>
                      )}
                    </p>
                    {event.detail && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{event.detail}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(event.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
