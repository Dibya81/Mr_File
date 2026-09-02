import { formatDistanceToNow } from 'date-fns';
import { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { clsx } from 'clsx';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function getProcessingStatusColor(status: string): string {
  const map: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    processing: 'text-blue-600 bg-blue-50',
    queued: 'text-yellow-600 bg-yellow-50',
    uploaded: 'text-gray-600 bg-gray-50',
    failed: 'text-red-600 bg-red-50',
    operational: 'text-green-600 bg-green-50',
    degraded: 'text-yellow-600 bg-yellow-50',
    unavailable: 'text-red-600 bg-red-50',
    unknown: 'text-gray-600 bg-gray-50',
    not_monitored: 'text-gray-600 bg-gray-50',
    active: 'text-green-600 bg-green-50',
    revoked: 'text-gray-600 bg-gray-50',
    active_24h: 'text-blue-600 bg-blue-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}

export function getProcessingStatusDot(status: string): string {
  const map: Record<string, string> = {
    completed: 'bg-green-500',
    processing: 'bg-blue-500',
    queued: 'bg-yellow-500',
    uploaded: 'bg-gray-400',
    failed: 'bg-red-500',
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unavailable: 'bg-red-500',
    unknown: 'bg-gray-400',
    not_monitored: 'bg-gray-300',
    active: 'bg-green-500',
    revoked: 'bg-gray-400',
  };
  return map[status] || 'bg-gray-400';
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    info: 'text-blue-600 bg-blue-50',
    warning: 'text-yellow-600 bg-yellow-50',
    critical: 'text-red-600 bg-red-50',
  };
  return map[severity] || 'text-gray-600 bg-gray-50';
}

export function getSeverityDot(severity: string): string {
  const map: Record<string, string> = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  return map[severity] || 'bg-gray-400';
}

export function getUserRoleBadge(role: string): string {
  return role === 'admin'
    ? 'text-purple-700 bg-purple-50 border border-purple-200'
    : 'text-gray-600 bg-gray-50 border border-gray-200';
}

export function getFileTypeColor(type: string): string {
  const lower = type.toLowerCase();
  if (lower === 'pdf') return 'text-red-600 bg-red-50';
  if (['doc', 'docx', 'word'].includes(lower)) return 'text-blue-600 bg-blue-50';
  if (['xls', 'xlsx', 'csv', 'excel'].includes(lower)) return 'text-green-600 bg-green-50';
  if (['ppt', 'pptx', 'powerpoint'].includes(lower)) return 'text-orange-600 bg-orange-50';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'image'].includes(lower)) return 'text-pink-600 bg-pink-50';
  if (['mp4', 'mov', 'avi', 'video'].includes(lower)) return 'text-purple-600 bg-purple-50';
  if (['zip', 'rar', '7z', 'archive'].includes(lower)) return 'text-amber-600 bg-amber-50';
  return 'text-gray-600 bg-gray-50';
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function buildPagination(page: number, perPage: number, total: number) {
  const totalPages = Math.ceil(total / perPage);
  const from = Math.min((page - 1) * perPage + 1, total);
  const to = Math.min(page * perPage, total);
  return { totalPages, from, to };
}
