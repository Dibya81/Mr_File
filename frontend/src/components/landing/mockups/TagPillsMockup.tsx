import { Plus } from 'lucide-react';

interface TagPillsMockupProps {
  className?: string;
}

const tags = [
  { label: 'Receipt', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  { label: 'Contract', bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  { label: 'Tax 2024', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  { label: 'Invoice', bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  { label: 'Report', bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  { label: 'Personal', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
  { label: '2025', bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
];

export default function TagPillsMockup({ className = '' }: TagPillsMockupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, i) => (
        <button
          key={i}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
            border text-xs font-medium
            transition-all duration-150 cursor-default
            hover:shadow-sm hover:-translate-y-0.5
            active:translate-y-0
            ${tag.bg} ${tag.text} ${tag.border}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tag.dot}`} />
          {tag.label}
        </button>
      ))}

      {/* Add tag button */}
      <button
        className="
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
          border-2 border-dashed border-gray-300 dark:border-gray-600
          text-gray-400 dark:text-gray-500 text-xs font-medium
          hover:border-gray-400 dark:hover:border-gray-500
          hover:text-gray-500 dark:hover:text-gray-400
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-all duration-150 cursor-pointer
        "
      >
        <Plus className="w-3.5 h-3.5" />
        Add tag
      </button>
    </div>
  );
}
