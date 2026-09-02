import {
  FileText,
  FileSpreadsheet,
  File,
  Image,
  Search,
  Filter,
  Upload,
  FolderOpen,
  Tag,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';

interface DashboardMockupProps {
  className?: string;
}

const documents = [
  { name: 'Q4_Report_2025.pdf', size: '2.4 MB', type: 'pdf', color: 'border-red-500', owner: 'MK' },
  { name: 'Invoice_Sarah_Chen.xlsx', size: '340 KB', type: 'xlsx', color: 'border-emerald-500', owner: 'SC' },
  { name: 'Contract_Draft_v3.docx', size: '1.1 MB', type: 'docx', color: 'border-blue-500', owner: 'JD' },
  { name: 'Tax_2024_summary.pdf', size: '890 KB', type: 'pdf', color: 'border-red-500', owner: 'MK' },
  { name: 'Meeting_Notes_Jan.pdf', size: '124 KB', type: 'pdf', color: 'border-red-500', owner: 'AL' },
  { name: 'Presentation_Q1.pptx', size: '5.2 MB', type: 'pptx', color: 'border-orange-500', owner: 'SC' },
];

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'xlsx':
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    case 'docx':
      return <File className="w-5 h-5 text-blue-500" />;
    case 'pptx':
      return <File className="w-5 h-5 text-orange-500" />;
    default:
      return <File className="w-5 h-5 text-gray-400" />;
  }
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    xlsx: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    docx: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    pptx: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type.toUpperCase()}
    </span>
  );
};

export default function DashboardMockup({ className = '' }: DashboardMockupProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[480px] w-full ${className}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center min-w-0">
          <div className="bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 font-mono w-full max-w-[180px] truncate">
            app.mydocuments.io/documents
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-40 flex-shrink-0 bg-gray-900 dark:bg-black border-r border-gray-800 flex flex-col py-4">
          {/* Logo area */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-semibold">DocumentVault</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1.5 bg-gray-800 rounded-md">
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderOpen className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <span className="text-[11px] text-gray-300 truncate">All Documents</span>
              </div>
              <span className="text-[10px] text-gray-500 bg-gray-700 px-1.5 rounded">24</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-800 rounded-md cursor-default">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">Reports</span>
              </div>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 rounded">8</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-800 rounded-md cursor-default">
              <div className="flex items-center gap-1.5 min-w-0">
                <Image className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">Shared</span>
              </div>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 rounded">12</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-800 rounded-md cursor-default">
              <div className="flex items-center gap-1.5 min-w-0">
                <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">Trash</span>
              </div>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 rounded">3</span>
            </div>

            {/* Tags section */}
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-1 px-2 mb-2">
                <Tag className="w-3 h-3 text-gray-600" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Tags</span>
              </div>
              <div className="px-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-gray-400">Receipts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-gray-400">Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-gray-400">Tax</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              All Documents <span className="text-gray-400 font-normal hidden sm:inline">· 24 files</span>
            </h2>
            <div className="flex-1" />
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-7 pr-2 py-1 text-[11px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md w-28 placeholder-gray-400 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter className="w-3 h-3" />
              Filter
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md font-medium whitespace-nowrap">
              <Upload className="w-3 h-3" />
              Upload
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2.5">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 cursor-default hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 relative"
                >
                  {/* Left color border */}
                  <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${doc.color}`} />

                  {/* File icon + info */}
                  <div className="flex items-start gap-2 pl-1.5">
                    <div className="mt-0.5">
                      <FileIcon type={doc.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <TypeBadge type={doc.type} />
                        <span className="text-[9px] text-gray-400">{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: owner */}
                  <div className="flex items-center justify-between mt-2 pl-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">{doc.owner}</span>
                      </div>
                      <span className="text-[9px] text-gray-400">Owner</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
