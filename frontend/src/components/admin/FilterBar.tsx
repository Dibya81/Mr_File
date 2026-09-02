import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch: (value: string) => void;
  searchValue: string;
  filters?: React.ReactNode;
  onRefresh?: () => void;
  refreshLabel?: string;
}

export default function FilterBar({
  searchPlaceholder,
  onSearch,
  searchValue,
  filters,
  onRefresh,
  refreshLabel,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder ?? t('admin.search')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              placeholder:text-gray-400 transition"
          />
          {searchValue && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-gray-400"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          {/* Filter toggle */}
          {filters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              {t('admin.filters')}
            </button>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {refreshLabel ?? t('admin.refresh')}
            </button>
          )}
        </div>
      </div>

      {/* Expandable filters */}
      {showFilters && filters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          {filters}
        </div>
      )}
    </div>
  );
}
