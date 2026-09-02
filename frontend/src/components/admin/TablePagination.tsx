import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function TablePagination({
  page,
  perPage,
  total,
  onPageChange,
  loading,
}: TablePaginationProps) {
  const { t } = useTranslation();

  const totalPages = Math.ceil(total / perPage);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  if (totalPages <= 1 && total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white text-sm">
      <p className="text-gray-500">
        {t('admin.showing')} <span className="font-medium text-gray-900">{from}–{to}</span>{' '}
        {t('admin.of')} <span className="font-medium text-gray-900">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors"
          aria-label={t('admin.previous')}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (page <= 4) {
            pageNum = i + 1;
            if (i === 6) pageNum = totalPages;
            else if (i === 5) pageNum = -1; // ellipsis
          } else if (page >= totalPages - 3) {
            if (i === 0) pageNum = 1;
            else if (i === 1) pageNum = -1;
            pageNum = totalPages - (6 - i);
          } else {
            if (i === 0) pageNum = 1;
            else if (i === 1) pageNum = -1;
            else if (i === 2) pageNum = page;
            else if (i === 3) pageNum = page + 1;
            else if (i === 4) pageNum = -1;
            else if (i === 5) pageNum = totalPages;
            else pageNum = -1;
          }

          if (pageNum < 0) {
            return (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                …
              </span>
            );
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                page === pageNum
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors"
          aria-label={t('admin.next')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
