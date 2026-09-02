import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Tag,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/helpers';
import { formatFileSize } from '@/utils/helpers';
import { documentsApi } from '@/api/documents';
import { ProcessingStatus } from './ProcessingStatus';
import { useToast } from '@/hooks/useToast';

interface UploadItem {
  id: string;
  file: File;
  status:
    | 'pending'
    | 'uploading'
    | 'detecting'
    | 'extracting'
    | 'classifying'
    | 'completed'
    | 'failed';
  progress: number;
  error?: string;
  documentId?: string;
}

interface UploadZoneProps {
  folderId?: string;
  onClose?: () => void;
}

function FileIcon({ className }: { className?: string }) {
  return (
    <FileText
      className={cn('text-gray-400 dark:text-gray-500', className)}
      size={20}
    />
  );
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export default function UploadZone({ folderId, onClose }: UploadZoneProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isCompact, setIsCompact] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (payload: { file: File; uploadId: string }) => {
      const { file } = payload;
      setUploads((prev) =>
        prev.map((u) =>
          u.id === payload.uploadId ? { ...u, status: 'uploading' as const } : u
        )
      );
      const result = await documentsApi.upload(file, folderId);
      return { result, uploadId: payload.uploadId };
    },
    onSuccess: ({ uploadId }) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, status: 'detecting' as const } : u
        )
      );
      // Start processing progression
      simulateProcessing(uploadId);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: Error, payload) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === payload.uploadId
            ? {
                ...u,
                status: 'failed' as const,
                error: err.message || 'Upload failed',
              }
            : u
        )
      );
    },
  });

  const simulateProcessing = useCallback((uploadId: string) => {
    const stages: UploadItem['status'][] = [
      'detecting',
      'extracting',
      'classifying',
      'completed',
    ];
    let currentStageIndex = 0;

    const interval = setInterval(() => {
      currentStageIndex++;
      if (currentStageIndex < stages.length) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, status: stages[currentStageIndex] as UploadItem['status'] }
              : u
          )
        );
      } else {
        clearInterval(interval);
        // Upload complete - show notification
        setUploads((prev) => {
          const upload = prev.find((u) => u.id === uploadId);
          if (upload) {
            addToast(
              `${upload.file.name} — Ready`,
              'success',
              3000
            );
          }
          return prev;
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [addToast]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newItems: UploadItem[] = acceptedFiles.map((file) => ({
        id: generateId(),
        file,
        status: 'pending' as const,
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...newItems]);
      setIsCompact(true);

      // Start uploading each file
      newItems.forEach((item) => {
        uploadMutation.mutate({ file: item.file, uploadId: item.id });
      });
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: undefined,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      // Only allow removal of pending uploads
      if (upload && upload.status === 'pending') {
        return prev.filter((u) => u.id !== id);
      }
      return prev;
    });
  }, []);

  const getStatusBadge = (upload: UploadItem) => {
    const config: Record<
      UploadItem['status'],
      { icon: React.ReactNode; label: string; color: string }
    > = {
      pending: {
        icon: <Clock size={12} className="mr-1" />,
        label: 'Pending',
        color: 'bg-gray-500/10 text-gray-400',
      },
      uploading: {
        icon: <Upload size={12} className="mr-1" />,
        label: 'Uploading',
        color: 'bg-blue-500/10 text-blue-400',
      },
      detecting: {
        icon: <Search size={12} className="mr-1" />,
        label: 'Detecting...',
        color: 'bg-amber-500/10 text-amber-400',
      },
      extracting: {
        icon: <FileText size={12} className="mr-1" />,
        label: 'Extracting...',
        color: 'bg-purple-500/10 text-purple-400',
      },
      classifying: {
        icon: <Tag size={12} className="mr-1" />,
        label: 'Classifying...',
        color: 'bg-cyan-500/10 text-cyan-400',
      },
      completed: {
        icon: <CheckCircle2 size={12} className="mr-1" />,
        label: 'Ready',
        color: 'bg-green-500/10 text-green-400',
      },
      failed: {
        icon: <AlertCircle size={12} className="mr-1" />,
        label: upload.error || 'Failed',
        color: 'bg-red-500/10 text-red-400',
      },
    };

    const { icon, label, color } = config[upload.status];

    return (
      <span
        className={cn(
          'inline-flex items-center text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
          color
        )}
      >
        {icon}
        {label}
      </span>
    );
  };

  const hasActiveUploads = uploads.some(
    (u) => !['completed', 'failed'].includes(u.status)
  );

  return (
    <div className="dark:bg-white/[0.03] bg-gray-50/50 backdrop-blur-xl dark:border-white/10 border-gray-200/60 rounded-2xl overflow-hidden">
      {/* Header */}
      {(onClose || isCompact) && (
        <div className="flex items-center justify-between px-4 py-3 dark:border-white/5 border-gray-100">
          <h3 className="text-sm font-medium dark:text-white/90 text-gray-700">
            {isCompact ? 'Uploading...' : 'Upload Documents'}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-gray-100 dark:text-white/50 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative transition-all duration-200 cursor-pointer',
          isCompact ? 'p-3' : 'p-8 mx-4 mt-4 mb-2',
          isDragActive
            ? 'border-primary-500 bg-primary-500/5'
            : 'border border-dashed dark:border-white/20 dark:hover:border-white/30 border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            'text-center',
            isDragActive && 'scale-105'
          )}
        >
          <Upload
            size={isCompact ? 20 : 40}
            className={cn(
              'mx-auto mb-2 transition-colors',
              isDragActive
                ? 'text-primary-500 dark:text-primary-400'
                : 'dark:text-white/40 text-gray-400',
              isCompact && 'mb-0'
            )}
          />
          {!isCompact && (
            <>
              <p className="text-sm dark:text-white/60 text-gray-600 mb-1">
                {isDragActive
                  ? 'Drop files here...'
                  : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="text-xs dark:text-white/30 text-gray-400">
                Any file up to 50MB
              </p>
            </>
          )}
          {isCompact && (
            <p className="text-xs dark:text-white/40 text-gray-400">
              {isDragActive ? 'Drop to add' : 'Drop more files'}
            </p>
          )}
        </div>
      </div>

      {/* Upload List */}
      <AnimatePresence mode="popLayout">
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
              {uploads.map((upload) => (
                <motion.div
                  key={upload.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-xl dark:bg-white/[0.02] bg-white/60 dark:border-white/5 border-gray-100 group"
                >
                  <FileIcon />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white/80 text-gray-700 truncate">
                      {upload.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs dark:text-white/40 text-gray-400">
                        {formatFileSize(upload.file.size)}
                      </span>
                      {upload.status === 'uploading' && (
                        <span className="text-xs text-blue-500 dark:text-blue-400">
                          {upload.progress}%
                        </span>
                      )}
                    </div>

                    {/* Progress bar for uploading status */}
                    {upload.status === 'uploading' && (
                      <div className="mt-1.5 h-1 dark:bg-white/10 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  {getStatusBadge(upload)}

                  {/* Remove button - only for pending uploads */}
                  {upload.status === 'pending' && (
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="p-1.5 rounded-lg dark:hover:bg-white/10 hover:bg-gray-100 dark:text-white/30 text-gray-400 dark:hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
