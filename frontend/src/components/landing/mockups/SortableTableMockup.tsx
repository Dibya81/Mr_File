import { ChevronUp, FileText, FileSpreadsheet, File } from 'lucide-react';

interface SortableTableMockupProps {
  className?: string;
}

const rows = [
  { name: 'Q4_Report_2025.pdf', type: 'pdf', size: '2.4 MB', modified: '2m ago', icon: 'pdf' },
  { name: 'Invoice_Sarah_Chen.xlsx', type: 'xlsx', size: '340 KB', modified: '1h ago', icon: 'xlsx' },
  { name: 'Contract_Draft_v3.docx', type: 'docx', size: '1.1 MB', modified: 'Yesterday', icon: 'docx' },
  { name: 'Tax_2024_summary.pdf', type: 'pdf', size: '890 KB', modified: '3d ago', icon: 'pdf' },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'pdf') return <FileText className="w-3.5 h-3.5 text-red-500" />;
  if (type === 'xlsx') return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />;
  return <File className="w-3.5 h-3.5 text-blue-500" />;
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    xlsx: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    docx: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors[type]}`}>
      {type.toUpperCase()}
    </span>
  );
};

export default function SortableTableMockup({ className = '' }: SortableTableMockupProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800
        shadow-sm shadow-gray-200/30 dark:shadow-gray-950/30 overflow-hidden
        ${className}
      `}
    >
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            {/* Name column — sorted */}
            <th className="px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Name
                </span>
                <ChevronUp className="w-3.5 h-3.5 text-primary-500" />
              </div>
            </th>
            {/* Type */}
            <th className="px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </span>
            </th>
            {/* Size */}
            <th className="px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Size
              </span>
            </th>
            {/* Modified */}
            <th className="px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Modified
                </span>
                <svg className="w-3 h-3 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`
                group cursor-default
                ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'}
                hover:bg-blue-50/50 dark:hover:bg-blue-950/30
                transition-colors duration-100
              `}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <TypeIcon type={row.type} />
                  <span className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate max-w-[140px]">
                    {row.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <TypeBadge type={row.type} />
              </td>
              <td className="px-4 py-2.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  {row.size}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {row.modified}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          Showing <span className="font-medium text-gray-600 dark:text-gray-400">4</span> of{' '}
          <span className="font-medium text-gray-600 dark:text-gray-400">24</span> documents
        </span>
        <div className="flex items-center gap-2">
          <button className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
            Previous
          </button>
          <button className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
