import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, FileText, Tag, HardDrive, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import MockupFrame from './MockupFrame';
import DashboardMockup from './mockups/DashboardMockup';
import DocumentWithBoundingBoxes from './mockups/DocumentWithBoundingBoxes';
import TagPillsMockup from './mockups/TagPillsMockup';
import FolderTreeMockup from './mockups/FolderTreeMockup';

const tabs = [
  { key: 'upload', icon: Upload, labelKey: 'processing.tabs.upload' },
  { key: 'detect', icon: Search, labelKey: 'processing.tabs.detect' },
  { key: 'extract', icon: FileText, labelKey: 'processing.tabs.extract' },
  { key: 'classify', icon: Tag, labelKey: 'processing.tabs.classify' },
];

const stepLabels = [
  { key: 'upload', icon: Upload, color: 'from-blue-500 to-blue-600' },
  { key: 'detect', icon: Search, color: 'from-amber-500 to-orange-500' },
  { key: 'extract', icon: FileText, color: 'from-emerald-500 to-green-500' },
  { key: 'classify', icon: Tag, color: 'from-purple-500 to-pink-500' },
  { key: 'store', icon: HardDrive, color: 'from-primary-500 to-indigo-600' },
];

const previewContent: Record<string, React.ReactNode> = {
  upload: (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-20 h-20 rounded-2xl border border-dashed border-blue-400/60 dark:border-blue-400/40 flex items-center justify-center bg-blue-500/5">
        <Upload size={32} className="text-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Drop files here to upload
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, images and more</p>
      </div>
      <div className="w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-500">invoice_q4_2025.pdf · 2.4 MB</p>
    </div>
  ),
  detect: (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-24 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center">
        <FileText size={28} className="text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-100">Inspecting content…</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-slate-500"
          >
            Magic bytes analysis
          </motion.span>
        </div>
      </div>
      <div className="w-40 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Confidence</span>
          <span className="font-medium text-emerald-400">98.7%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '98.7%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={11} />
        Confirmed: PDF
      </div>
    </div>
  ),
  extract: (
    <div className="h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Extracted Fields</span>
        <span className="text-xs text-emerald-400 font-medium">8 fields found</span>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'Invoice #', value: 'INV-2025-0847', color: 'text-blue-400' },
          { label: 'Vendor', value: 'Sarah Chen Consulting', color: 'text-emerald-400' },
          { label: 'Amount', value: '$4,200.00', color: 'text-amber-400' },
          { label: 'Date', value: 'Jan 15, 2025', color: 'text-purple-400' },
          { label: 'Due', value: 'Feb 15, 2025', color: 'text-red-400' },
          { label: 'Category', value: 'Invoice', color: 'text-primary-400' },
        ].map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5"
          >
            <span className="text-xs text-slate-400">{field.label}</span>
            <span className={`text-xs font-semibold ${field.color}`}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  classify: (
    <div className="h-full flex flex-col gap-4 p-4">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Auto-classified as</span>
      <div className="flex flex-wrap gap-1.5">
        {['Invoice', 'Finance', '2025', 'Q4', 'Unpaid'].map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
        <p className="text-xs text-slate-400 mb-1">Suggested folder</p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
          <FolderTreeMockup className="flex-shrink-0" />
          <span>Finance / Invoices / 2025</span>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 size={13} />
        <span>Moved to Finance/2025 automatically</span>
      </div>
    </div>
  ),
};

export default function ProcessingSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upload');

  const currentIndex = tabs.findIndex((t) => t.key === activeTab);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            {t('processing.title')}
          </h2>
          <p className="mt-5 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('processing.subtitle')}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex flex-col gap-8">
            {/* Pill tabs */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 relative">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-full bg-blue-600 -z-10"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <Icon size={14} />
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content card */}
            <div className="grid lg:grid-cols-2 min-h-[380px] rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="space-y-3">
                  {stepLabels.map((step, i) => {
                    const Icon = step.icon;
                    const isDone = i < currentIndex;
                    const isActive = i === currentIndex;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isActive
                                ? `bg-gradient-to-br ${step.color} text-white`
                                : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-sm font-medium ${
                              isActive
                                ? 'text-slate-100'
                                : isDone
                                  ? 'text-emerald-400'
                                  : 'text-slate-500'
                            }`}
                          >
                            {t(`processing.${step.key}`)}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-xs text-slate-400 animate-pulse">Running…</span>
                        )}
                        {isDone && (
                          <span className="text-xs text-emerald-400">Done</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative p-6 lg:p-8 bg-white/[0.015]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {previewContent[activeTab]}
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
