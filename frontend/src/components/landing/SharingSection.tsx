import { useTranslation } from 'react-i18next';
import { UserPlus, Eye, XCircle } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import MockupFrame from './MockupFrame';
import AccessControlModal from './mockups/AccessControlModal';

export default function SharingSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: UserPlus,
      label: t('sharing.shareWith'),
      desc: 'Share via username — no public links by default.',
    },
    {
      icon: Eye,
      label: t('sharing.permission'),
      desc: 'View-only or view+download — you decide.',
    },
    {
      icon: XCircle,
      label: t('sharing.revoke'),
      desc: 'Remove access instantly, any time.',
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
              {t('sharing.title')}
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              {t('sharing.subtitle')}
            </p>

            <div className="mt-9 space-y-3">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <MockupFrame>
              <div className="p-3">
                <AccessControlModal />
              </div>
            </MockupFrame>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
