import { useTranslation } from 'react-i18next';
import { FileText, User, Calendar, Type, Folder, CheckCircle } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import DocumentWithBoundingBoxes from './mockups/DocumentWithBoundingBoxes';

const fields = [
  { key: 'pages', icon: FileText, value: '14', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { key: 'author', icon: User, value: 'Sarah Chen', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { key: 'created', icon: Calendar, value: 'Jan 15, 2025', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { key: 'words', icon: Type, value: '4,200', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { key: 'category', icon: Folder, value: 'Invoice', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
  { key: 'status', icon: CheckCircle, value: 'Processed', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
];

export default function ExtractionSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-deep-2 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
              {t('extraction.title')}
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              {t('extraction.subtitle')}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.key}
                    className={`p-4 rounded-xl ${field.bg} border border-gray-100 dark:border-white/10`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} className={field.color} />
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t(`extraction.${field.key}`)}
                      </span>
                    </div>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {field.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="relative">
              <DocumentWithBoundingBoxes />
              <div className="absolute -bottom-4 -right-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-glow-sm">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  All 8 fields extracted
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
