import { useTranslation } from 'react-i18next';
import AnimatedSection from './AnimatedSection';
import BeforeAfterSlider from './BeforeAfterSlider';
import { FileText, FileImage, FileSpreadsheet, Folder, Search, Tag } from 'lucide-react';

const BeforeSide = () => (
  <div className="absolute inset-0 p-6 bg-gradient-to-br from-red-50/40 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/10">
    <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4">
      Before · Your Desktop
    </div>
    <div className="space-y-2">
      {[
        { name: 'Document_v3_final_FINAL.pdf', size: '2.4 MB', icon: FileText, type: 'pdf' },
        { name: 'IMG_2847.jpg', size: '3.1 MB', icon: FileImage, type: 'jpg' },
        { name: 'untitled spreadsheet.xlsx', size: '—', icon: FileSpreadsheet, type: 'xlsx' },
        { name: 'Scan_2024_11_12.pdf', size: '890 KB', icon: FileText, type: 'pdf' },
        { name: 'invoice_2_2_REVISED.pdf', size: '1.2 MB', icon: FileText, type: 'pdf' },
        { name: 'doc(3) (2).docx', size: '—', icon: FileText, type: 'docx' },
        { name: 'report.pdf', size: '? KB', icon: FileText, type: '?' },
      ].map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
          >
            <Icon size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-slate-300 truncate font-mono flex-1">
              {f.name}
            </span>
            <span className="text-[10px] text-gray-400">{f.size}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const AfterSide = () => (
  <div className="absolute inset-0 p-6 bg-gradient-to-br from-emerald-50/40 to-blue-50/30 dark:from-emerald-950/20 dark:to-blue-950/10">
    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
      After · DocumentVault
    </div>
    <div className="space-y-2">
      {[
        {
          name: 'Q4_Report_2025.pdf',
          tag: 'Report · 2025',
          icon: FileText,
          color: 'text-red-500',
        },
        {
          name: 'Invoice_Sarah_Chen.xlsx',
          tag: 'Invoice',
          icon: FileSpreadsheet,
          color: 'text-green-500',
        },
        {
          name: 'Contract_Draft_v3.docx',
          tag: 'Contract',
          icon: FileText,
          color: 'text-blue-500',
        },
        {
          name: 'Tax_2024_summary.pdf',
          tag: 'Tax · 2024',
          icon: FileText,
          color: 'text-red-500',
        },
        {
          name: 'Meeting_Notes_Jan.pdf',
          tag: 'Notes',
          icon: FileText,
          color: 'text-amber-500',
        },
      ].map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-emerald-200 dark:border-emerald-500/20 shadow-sm"
          >
            <Icon size={14} className={`${f.color} flex-shrink-0`} />
            <span className="text-xs text-gray-900 dark:text-white font-medium truncate flex-1">
              {f.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium">
              {f.tag}
            </span>
          </div>
        );
      })}
    </div>
    <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
      <div className="flex items-center gap-1">
        <Folder size={12} />
        <span>Auto-foldered</span>
      </div>
      <div className="flex items-center gap-1">
        <Search size={12} />
        <span>Searchable</span>
      </div>
      <div className="flex items-center gap-1">
        <Tag size={12} />
        <span>Tagged</span>
      </div>
    </div>
  </div>
);

export default function ProblemSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-deep-2 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 dark:from-blue-900/20 via-transparent to-transparent -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            {t('problem.title')}
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('problem.subtitle')}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <BeforeAfterSlider
            before={<BeforeSide />}
            after={<AfterSide />}
            beforeLabel={t('problem.beforeLabel')}
            afterLabel={t('problem.afterLabel')}
          />
        </AnimatedSection>

        {/* Bridging question — keeps the page from feeling like a text void */}
        <AnimatedSection delay={0.2} className="text-center mt-16">
          <p className="text-xl sm:text-2xl font-medium text-gray-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            <span className="text-gray-900 dark:text-white">{t('idea.title')}</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
