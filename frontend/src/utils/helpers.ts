import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    xlsx: '📊',
    pptx: '📑',
  };
  return icons[type] || '📁';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    processing: 'text-blue-600 bg-blue-50',
    queued: 'text-yellow-600 bg-yellow-50',
    uploaded: 'text-gray-600 bg-gray-50',
    failed: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}
