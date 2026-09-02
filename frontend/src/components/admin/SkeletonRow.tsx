import { cn } from '../../utils/adminHelpers';

interface SkeletonRowProps {
  cols?: number;
  className?: string;
}

export function SkeletonRow({ cols = 4, className }: SkeletonRowProps) {
  return (
    <tr className={cn('border-b border-gray-100', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded skeleton-shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-white border rounded-xl p-5', className)}>
      <div className="h-4 w-1/3 rounded skeleton-shimmer mb-3" />
      <div className="h-8 w-2/3 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-1/2 rounded skeleton-shimmer" />
    </div>
  );
}

export function SkeletonKpi() {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="h-3 w-1/2 rounded skeleton-shimmer mb-4" />
      <div className="h-8 w-3/4 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-1/3 rounded skeleton-shimmer" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="h-4 w-1/4 rounded skeleton-shimmer" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-2 text-left">
                <div className="h-3 w-3/4 rounded skeleton-shimmer" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
