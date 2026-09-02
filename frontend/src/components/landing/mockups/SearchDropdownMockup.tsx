import { Search, FileText, FileSpreadsheet, File } from 'lucide-react';

interface SearchDropdownMockupProps {
  className?: string;
  active?: boolean;
}

const suggestions = [
  { name: 'Q4_Report_2025.pdf', type: 'pdf', icon: 'file', tag: null },
  { name: 'Contract_Draft_v3.docx', type: 'docx', icon: 'file', tag: 'Contract' },
  { name: 'Invoice_Sarah_Chen.xlsx', type: 'xlsx', icon: 'spreadsheet', tag: null },
  { name: 'Tax_2024_summary.pdf', type: 'pdf', icon: 'file', tag: 'Tax 2024' },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (type === 'xlsx') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  return <File className="w-4 h-4 text-blue-500" />;
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    xlsx: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    docx: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type.toUpperCase()}
    </span>
  );
};

export default function SearchDropdownMockup({ className = '', active = true }: SearchDropdownMockupProps) {
  return (
    <div className={`relative w-full max-w-sm mx-auto ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search documents..."
          className="
            w-full pl-9 pr-4 py-2.5 text-sm
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl
            placeholder-gray-400 dark:placeholder-gray-500
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            shadow-sm
            transition-all duration-200
          "
          defaultValue="contract"
          readOnly
        />
        {/* Keyboard hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
          <kbd className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono">
            ⌘
          </kbd>
          <kbd className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono">
            K
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      {active && (
        <div
          className="
            absolute top-full left-0 right-0 mt-2
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl
            shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50
            overflow-hidden
            z-50
          "
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Suggestions
            </span>
            <span className="text-[10px] text-gray-400">
              {suggestions.length} results
            </span>
          </div>

          {/* Items */}
          <div className="py-1">
            {suggestions.map((item, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-default
                  transition-colors duration-100
                  ${i === 1
                    ? 'bg-blue-50 dark:bg-blue-950/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
                  }
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <TypeIcon type={item.type} />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        text-xs font-medium truncate
                        ${i === 1
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-800 dark:text-gray-200'
                        }
                      `}
                    >
                      {item.name}
                    </span>
                    <TypeBadge type={item.type} />
                    {item.tag && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900 font-medium">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronIcon className={i === 1 ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600'} />

                {/* Highlight indicator */}
                {i === 1 && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Press</span>
              <kbd className="text-[9px] text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono">
                Enter
              </kbd>
              <span className="text-[10px] text-gray-400">to select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[9px] text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono">
                ↑
              </kbd>
              <kbd className="text-[9px] text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono">
                ↓
              </kbd>
              <span className="text-[10px] text-gray-400">to navigate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 flex-shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
