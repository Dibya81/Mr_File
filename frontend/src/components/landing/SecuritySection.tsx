import { useTranslation } from 'react-i18next';
import { Lock, Shield, Server } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import MockupFrame from './MockupFrame';
import AccessControlModal from './mockups/AccessControlModal';

export default function SecuritySection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Lock,
      label: t('security.lock'),
      desc: 'Per-file password protection with server-side enforcement.',
    },
    {
      icon: Shield,
      label: t('security.protect'),
      desc: 'Encrypted at rest and in transit with AES-256.',
    },
    {
      icon: Server,
      label: t('security.enforce'),
      desc: 'Protection enforced server-side, not just the UI.',
    },
  ];

  return (
    <section id="security" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />
      <div className="absolute inset-0 grid-bg-light dark:grid-bg -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <AnimatedSection className="order-2 lg:order-1">
            <div className="relative max-w-lg mx-auto lg:max-w-none">
              <MockupFrame>
                <div className="p-3">
                  <AccessControlModal />
                </div>
              </MockupFrame>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="order-1 lg:order-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Shield size={14} className="text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Security First
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight tracking-tight">
              {t('security.title')}
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              {t('security.subtitle')}
            </p>

            <div className="mt-9 space-y-4">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.label}</span>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
