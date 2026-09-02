import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentsApi } from '../api/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  documentId?: string;
}

export function useUpload(folderId?: string) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const queryClient = useQueryClient();

  const uploadFile = useCallback(async (file: File) => {
    const uploadState: UploadState = { file, progress: 0, status: 'uploading' };
    setUploads((prev) => [...prev, uploadState]);

    try {
      const res = await documentsApi.upload(file, folderId);
      if (res.success) {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file
              ? { ...u, status: 'processing', progress: 100, documentId: res.data.id }
              : u
          )
        );
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }
    } catch (err: any) {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, status: 'failed', error: err.response?.data?.error?.message || 'Upload failed' }
            : u
        )
      );
    }
  }, [folderId, queryClient]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const dropzone = useDropzone({
    onDrop,
    multiple: true,
  });

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'completed' && u.status !== 'failed'));
  };

  return { uploads, dropzone, clearCompleted };
}
