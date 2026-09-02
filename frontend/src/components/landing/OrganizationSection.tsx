import { useTranslation } from 'react-i18next';
import { FolderTree, Search, Tag, ArrowUpDown, Sparkles } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import BentoCard from './BentoCard';
import FolderTreeMockup from './mockups/FolderTreeMockup';
import SearchDropdownMockup from './mockups/SearchDropdownMockup';
import TagPillsMockup from './mockups/TagPillsMockup';
import SortableTableMockup from './mockups/SortableTableMockup';
import { useEffect, useState } from 'react';

const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const inc = target / steps;
    const interval = duration / steps;
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= steps) {
        setValue(target);
        clearInterval(id);
      } else {
        setValue(Math.round(i * inc));
      }
    }, interval);
    return () => clearInterval(id);
  }, [target]);
  return (
    <span className="text-3xl font-semibold text-gray-900 dark:text-white">
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

export default function OrganizationSection() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-50 dark:bg-deep -z-10" />
      <div className="absolute inset-0 grid-bg dark:grid-bg -z-10 opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 mb-5">
            <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">
              Organization
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-[1.05] tracking-tight">
            {t('organization.title')}
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('organization.subtitle')}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BentoCard
              wide
              icon={<FolderTree size={18} className="text-blue-500" />}
              title={t('organization.bento.folders.title')}
              body={t('organization.bento.folders.body')}
            >
              <FolderTreeMockup />
            </BentoCard>

            <BentoCard
              icon={<Search size={18} className="text-emerald-500" />}
              title={t('organization.bento.search.title')}
              body={t('organization.bento.search.body')}
            >
              <SearchDropdownMockup active />
            </BentoCard>

            <BentoCard
              icon={<Tag size={18} className="text-purple-500" />}
              title={t('organization.bento.tags.title')}
              body={t('organization.bento.tags.body')}
            >
              <TagPillsMockup />
            </BentoCard>

            <BentoCard
              icon={<ArrowUpDown size={18} className="text-amber-500" />}
              title={t('organization.bento.sort.title')}
              body={t('organization.bento.sort.body')}
            >
              <SortableTableMockup />
            </BentoCard>

            <BentoCard
              icon={<Sparkles size={18} className="text-primary-500" />}
              title={t('organization.bento.counter.title')}
              body={t('organization.bento.counter.body')}
            >
              <div className="mt-2 flex items-end justify-between">
                <Counter target={1284} />
                <div className="text-xs text-emerald-500 font-medium">+12% today</div>
              </div>
            </BentoCard>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
