import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Globe } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const companies = [
  'Legal',
  'Finance',
  'Healthcare',
  'Education',
  'Consulting',
  'Engineering',
];

export default function TrustBar() {
  const { t } = useTranslation();

  return (
    <section className="relative py-16 border-y border-gray-200/60 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <AnimatedSection>
          <p className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-8">
            {t('trust.title')}
          </p>

          {/* Logo row with gradient fade on sides */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/80 dark:from-[#090D16]/80 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/80 dark:from-[#090D16]/80 to-transparent pointer-events-none z-10" />
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 overflow-hidden">
              {companies.map((c) => (
                <div
                  key={c}
                  className="text-sm font-semibold tracking-tight text-gray-400 dark:text-slate-500 whitespace-nowrap"
                  style={{ fontFeatureSettings: '"ss01"' }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-8">
            {[
              { icon: ShieldCheck, label: t('trust.compliance.soc'), color: 'text-emerald-500' },
              { icon: Lock, label: t('trust.compliance.encryption'), color: 'text-blue-500' },
              { icon: Globe, label: t('trust.compliance.gdpr'), color: 'text-purple-500' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <Icon size={14} className={badge.color} />
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
