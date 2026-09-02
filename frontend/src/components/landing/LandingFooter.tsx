import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, Github, Twitter, Linkedin } from 'lucide-react';

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition"
  >
    {children}
  </a>
);

const ProductLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' },
];

const ResourceLinks = [
  { label: 'Documentation', href: '#docs' },
  { label: 'API Reference', href: '#api' },
  { label: 'Status', href: '#status' },
];

const CompanyLinks = [
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '#blog' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' },
];

const LegalLinks = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Cookie Policy', href: '#cookies' },
];

export default function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-gray-50 dark:bg-deep-2 border-t border-gray-200 dark:border-white/5">
      <div className="absolute inset-0 grid-bg-light dark:grid-bg opacity-50 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Lock size={16} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                DocumentVault
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs leading-relaxed">
              {t('footer.description')}
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-500 dark:text-slate-400">
                {t('footer.status.operational')}
              </span>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href="#twitter"
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
              >
                <Twitter size={14} />
              </a>
              <a
                href="#github"
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
              >
                <Github size={14} />
              </a>
              <a
                href="#linkedin"
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
              >
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.product')}
            </h4>
            <ul className="space-y-3">
              {ProductLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-3">
              {ResourceLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              {CompanyLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3">
              {LegalLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 dark:text-slate-500">
            © {new Date().getFullYear()} DocumentVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>SOC-2 Type II</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
              <Lock size={12} className="text-blue-500" />
              <span>256-bit AES</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
              <Globe size={12} className="text-purple-500" />
              <span>GDPR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
