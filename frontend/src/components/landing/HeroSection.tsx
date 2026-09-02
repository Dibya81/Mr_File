import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import MockupFrame from './MockupFrame';
import DashboardMockup from './mockups/DashboardMockup';
import GlowBackground from './GlowBackground';

export default function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x, y });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-x-hidden pt-32 pb-24"
    >
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />
      <div className="absolute inset-0 grid-bg dark:grid-bg -z-10" />
      <GlowBackground variant="blue" className="top-20 right-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          <div className="min-w-0 w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur mb-6"
            >
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-200">
                AI-Powered Document Workspace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-gray-900 dark:text-white"
            >
              <span className="block">{t('hero.title1')}</span>
              <span className="block mt-2 gradient-text">
                {t('hero.title2')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-slate-400 max-w-xl leading-relaxed break-words"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Link
                to="/signup"
                className="shine-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-glow-md text-sm sm:text-base"
              >
                {t('hero.cta')}
                <ArrowRight size={16} className="sm:hidden" />
                <ArrowRight size={18} className="hidden sm:block" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 border border-gray-300 dark:border-white/15 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-slate-200 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition backdrop-blur text-sm sm:text-base"
              >
                <Play size={12} className="sm:hidden" />
                <Play size={14} className="hidden sm:block" />
                {t('hero.secondary')}
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 text-xs text-gray-500 dark:text-slate-500"
            >
              No credit card required · Free forever plan
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-full mx-auto lg:mx-0 overflow-hidden"
          >
            <div
              className="relative will-change-transform rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-blue-500/10 w-full max-w-[420px] sm:max-w-[520px] lg:max-w-none mx-auto overflow-hidden lg:overflow-visible"
              style={{
                transform: `perspective(2000px) rotateY(${tilt.x * 1.2}deg) rotateX(${
                  -tilt.y * 1.2
                }deg)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <MockupFrame>
                <DashboardMockup />
              </MockupFrame>

              {/* Badge 1 — top-left corner of the mockup */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-3 -left-3 glass rounded-xl px-3 py-2 shadow-2xl shadow-blue-500/20 items-center gap-2 z-10 hidden md:flex"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    AI Extraction
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    99.4% accuracy
                  </p>
                </div>
              </motion.div>

              {/* Badge 2 — bottom-right corner of the mockup */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-3 -right-3 glass rounded-xl px-3 py-2 shadow-2xl shadow-blue-500/20 items-center gap-2 z-10 hidden md:flex"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Zap size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Today
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    12 files processed
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
