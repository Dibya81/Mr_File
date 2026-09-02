interface DocumentWithBoundingBoxesProps {
  className?: string;
  highlightField?: string;
}

const fields = [
  { id: 'invoice', label: 'Invoice #1234', color: 'blue', y: 'top' },
  { id: 'vendor', label: 'Sarah Chen Consulting', color: 'green', y: 'middle' },
  { id: 'amount', label: '$4,200.00', color: 'amber', y: 'amount' },
  { id: 'date', label: 'Due: Feb 15, 2026', color: 'purple', y: 'date' },
];

const colorMap: Record<string, { border: string; bg: string; text: string; darkBorder: string }> = {
  blue: {
    border: 'border-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    darkBorder: 'dark:border-blue-500',
  },
  green: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-300',
    darkBorder: 'dark:border-emerald-500',
  },
  amber: {
    border: 'border-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    darkBorder: 'dark:border-amber-500',
  },
  purple: {
    border: 'border-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-300',
    darkBorder: 'dark:border-purple-500',
  },
};

const lineItems = [
  'Document Processing Services',
  'Consulting & Data Extraction',
  'Quality Assurance Review',
  'Platform Integration Support',
  'Monthly Subscription — Enterprise',
];

export default function DocumentWithBoundingBoxes({
  className = '',
  highlightField,
}: DocumentWithBoundingBoxesProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Floating labels — right side */}
      {fields.map((field, i) => {
        const c = colorMap[field.color];
        const isHighlighted = highlightField === field.id;
        const topPositions = ['top-[22%]', 'top-[38%]', 'top-[54%]', 'top-[70%]'];

        return (
          <div
            key={field.id}
            className={`absolute right-0 flex items-center gap-2 z-10 ${topPositions[i]}`}
          >
            {/* Connecting line */}
            <div className={`w-6 h-px ${isHighlighted ? c.border : 'border-gray-300 dark:border-gray-600'}`} />
            {/* Pill label */}
            <div
              className={`
                px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap
                shadow-sm
                ${isHighlighted
                  ? `${c.border} ${c.bg} ${c.text} border-2`
                  : `border ${c.border} ${c.bg} ${c.text} border-dashed`
                }
              `}
            >
              {field.label}
            </div>
          </div>
        );
      })}

      {/* Document card */}
      <div
        className="
          relative bg-white dark:bg-gray-50 rounded-2xl shadow-xl
          border border-gray-200 dark:border-gray-200
          w-full max-w-sm mx-auto
          aspect-[3/4]
          overflow-hidden
        "
      >
        {/* Paper texture background */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Document header */}
        <div className="relative px-6 pt-8 pb-4 border-b border-gray-100 dark:border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-12 h-12 bg-red-50 dark:bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-800">INVOICE</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">DocumentVault extracted</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Confidence</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-700">99.8%</p>
            </div>
          </div>
        </div>

        {/* Document content lines */}
        <div className="relative px-6 py-5 space-y-3">
          {/* Invoice # row */}
          <div className={`relative ${highlightField === 'invoice' ? 'rounded border-2 border-blue-400 bg-blue-50/50 dark:bg-blue-100/50 p-1 -mx-1' : ''}`}>
            <div className={`h-4 rounded ${highlightField === 'invoice' ? 'bg-blue-100/50 dark:bg-blue-200/50' : 'bg-gray-100 dark:bg-gray-200'} w-32`} />
            <div className="h-3 rounded bg-gray-50 dark:bg-gray-100 w-24 mt-1" />
          </div>

          {/* Vendor */}
          <div className={`relative ${highlightField === 'vendor' ? 'rounded border-2 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-100/50 p-1 -mx-1' : ''}`}>
            <div className="h-3 rounded bg-gray-50 dark:bg-gray-100 w-20 mb-1.5" />
            <div className="h-4 rounded bg-gray-200 dark:bg-gray-300 w-48" />
            <div className="h-3 rounded bg-gray-50 dark:bg-gray-100 w-36 mt-1" />
          </div>

          {/* Line items */}
          <div className="pt-2 space-y-2">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-400" />
                  <div className={`h-3 rounded ${i === 0 ? 'bg-gray-200 dark:bg-gray-300 w-40' : 'bg-gray-50 dark:bg-gray-100 w-32'}`} />
                </div>
                <div className={`h-3 rounded ${i === 0 ? 'bg-gray-200 dark:bg-gray-300 w-14' : 'bg-gray-50 dark:bg-gray-100 w-12'}`} />
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-300 mt-4">
            <div className={`flex items-center justify-between ${highlightField === 'amount' ? 'rounded border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-100/50 p-1 -mx-1' : ''}`}>
              <div className="h-3 rounded bg-gray-200 dark:bg-gray-300 w-16" />
              <div className="h-5 rounded bg-gray-800 dark:bg-gray-900 w-24" />
            </div>

            {/* Due date */}
            <div className={`flex items-center justify-between mt-3 ${highlightField === 'date' ? 'rounded border-2 border-purple-400 bg-purple-50/50 dark:bg-purple-100/50 p-1 -mx-1' : ''}`}>
              <div className="h-3 rounded bg-gray-100 dark:bg-gray-200 w-20" />
              <div className="h-3 rounded bg-gray-200 dark:bg-gray-300 w-28" />
            </div>
          </div>

          {/* Signature line */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-200">
            <div className="h-6 rounded bg-gray-100 dark:bg-gray-200 w-32 border-b border-gray-300 dark:border-gray-400 border-dashed" />
          </div>
        </div>

        {/* Bounding box overlays (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 384 512"
          preserveAspectRatio="none"
        >
          {/* Invoice # bounding box */}
          <rect
            x="24"
            y="130"
            width="210"
            height="48"
            fill="none"
            stroke={highlightField === 'invoice' ? '#60a5fa' : '#93c5fd'}
            strokeWidth={highlightField === 'invoice' ? '2.5' : '1.5'}
            strokeDasharray={highlightField === 'invoice' ? 'none' : '6 3'}
            rx="4"
            className="animate-pulse"
          />
          {/* Vendor bounding box */}
          <rect
            x="24"
            y="210"
            width="240"
            height="70"
            fill="none"
            stroke={highlightField === 'vendor' ? '#34d399' : '#6ee7b7'}
            strokeWidth={highlightField === 'vendor' ? '2.5' : '1.5'}
            strokeDasharray={highlightField === 'vendor' ? 'none' : '6 3'}
            rx="4"
            className="animate-pulse"
            style={{ animationDelay: '0.3s' }}
          />
          {/* Amount bounding box */}
          <rect
            x="24"
            y="390"
            width="130"
            height="40"
            fill="none"
            stroke={highlightField === 'amount' ? '#fbbf24' : '#fcd34d'}
            strokeWidth={highlightField === 'amount' ? '2.5' : '1.5'}
            strokeDasharray={highlightField === 'amount' ? 'none' : '6 3'}
            rx="4"
            className="animate-pulse"
            style={{ animationDelay: '0.6s' }}
          />
          {/* Date bounding box */}
          <rect
            x="24"
            y="445"
            width="160"
            height="38"
            fill="none"
            stroke={highlightField === 'date' ? '#c084fc' : '#d8b4fe'}
            strokeWidth={highlightField === 'date' ? '2.5' : '1.5'}
            strokeDasharray={highlightField === 'date' ? 'none' : '6 3'}
            rx="4"
            className="animate-pulse"
            style={{ animationDelay: '0.9s' }}
          />
        </svg>
      </div>
    </div>
  );
}
