import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import DocumentWithBoundingBoxes from './mockups/DocumentWithBoundingBoxes';
import { Scan } from 'lucide-react';

const steps = [
  { key: 'step1', label: 'File uploaded', color: 'from-blue-500 to-blue-600' },
  { key: 'step2', label: 'Content inspected', color: 'from-amber-500 to-orange-500' },
  { key: 'step3', label: 'True type identified', color: 'from-emerald-500 to-green-500' },
];

export default function DetectionSection() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-deep -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-5">
            <Scan size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              File Detection
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            {t('detection.title')}
          </h2>
          <p className="mt-5 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('detection.subtitle')}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Step list (now part of the same card) */}
              <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5">
                <div className="space-y-3">
                  {steps.map((step, i) => {
                    const isActive = i === activeStep;
                    return (
                      <button
                        key={step.key}
                        onClick={() => setActiveStep(i)}
                        className={`relative w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all overflow-hidden ${
                          isActive
                            ? 'bg-white dark:bg-white/[0.05] border-primary-300 dark:border-primary-500/40 shadow-sm'
                            : 'bg-gray-50/60 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeStepGlow"
                            className="absolute inset-0 rounded-xl ring-2 ring-primary-500/30 dark:ring-primary-500/30"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div
                          className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${step.color} flex-shrink-0`}
                        >
                          {i + 1}
                        </div>
                        <div className="relative flex-1">
                          <span
                            className={`font-medium ${
                              isActive
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-slate-400'
                            }`}
                          >
                            {t(`detection.${step.key}`)}
                          </span>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeStepDot"
                            className="relative w-2 h-2 rounded-full bg-primary-500"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document preview */}
              <div className="relative p-6 lg:p-8 bg-gray-50/50 dark:bg-white/[0.015]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <DocumentWithBoundingBoxes
                      highlightField={
                        activeStep === 0
                          ? 'invoice'
                          : activeStep === 1
                            ? 'vendor'
                            : 'amount'
                      }
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${((activeStep + 1) / 3) * 100}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        {Math.round(((activeStep + 1) / 3) * 100)}%
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
