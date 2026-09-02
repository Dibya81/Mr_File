import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import GlowBackground from './GlowBackground';

export default function CTASection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />
      <GlowBackground variant="blue" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative glass rounded-3xl p-8 sm:p-12 lg:p-14 overflow-hidden">
            <div className="absolute inset-0 grid-bg dark:grid-bg opacity-30" />
            <GlowBackground variant="indigo" className="top-0 right-0" />

            <div className="relative z-10 grid lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-5">
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {t('cta.ready')}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
                  {t('cta.title')}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-xl lg:max-w-none">
                  {t('cta.subtitle')}
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 lg:justify-start justify-center">
                  <Link
                    to="/signup"
                    className="shine-button inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-glow-md"
                  >
                    {t('cta.button')}
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-300 dark:border-white/15 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-slate-200 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition backdrop-blur"
                  >
                    {t('cta.secondary')}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={14} className="text-blue-400" />
                    <span className="text-sm font-semibold text-white">
                      {t('footer.newsletter.title')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Product updates and release notes, straight to your inbox.
                  </p>
                  {submitted ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-400 font-medium">
                      <ShieldCheck size={16} />
                      {t('cta.subscribed')}
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('footer.newsletter.placeholder')}
                        required
                        className="flex-1 px-3.5 py-2.5 text-sm border border-white/15 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        {t('footer.newsletter.button')}
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-5 right-5 hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              />
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('footer.status.operational')}
              </span>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
