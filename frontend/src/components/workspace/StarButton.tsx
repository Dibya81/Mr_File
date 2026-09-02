import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import { cn } from '@/utils/helpers';
import { toast } from '@/hooks/useToast';

interface StarButtonProps {
  documentId: string;
  isStarred: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StarButton({ documentId, isStarred, size = 'md', className }: StarButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => documentsApi.toggleStar(documentId, !isStarred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-recent'] });
      queryClient.invalidateQueries({ queryKey: ['starred-documents'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-search'] });
    },
    onError: () => {
      toast.error('Failed to update star');
    },
  });

  const iconSize = size === 'sm' ? 13 : 15;
  const pad = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        mutation.mutate();
      }}
      data-no-select
      className={cn(
        pad,
        'rounded-lg transition-colors',
        isStarred
          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
          : 'text-slate-400 hover:text-amber-400 hover:bg-white/5',
        className
      )}
      title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
      aria-label={isStarred ? 'Unstar' : 'Star'}
    >
      <Star
        size={iconSize}
        className={cn(isStarred && 'fill-current')}
      />
    </button>
  );
}
