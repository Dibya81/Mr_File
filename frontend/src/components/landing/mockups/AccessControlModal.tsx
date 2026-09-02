import { X, Lock, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AccessControlModalProps {
  className?: string;
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <div
      className={`
        relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0
        ${on ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}
      `}
    >
      <div
        className={`
          absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${on ? 'translate-x-4' : 'translate-x-0.5'}
        `}
      />
    </div>
  );
}

function Radio({ checked = false }: { checked?: boolean }) {
  return (
    <div
      className={`
        w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
        transition-colors duration-200
        ${checked
          ? 'border-primary-500 bg-primary-500'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }
      `}
    >
      {checked && (
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      )}
    </div>
  );
}

export default function AccessControlModal({ className = '' }: AccessControlModalProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`
        relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/20 dark:shadow-black/50
        border border-gray-200 dark:border-gray-800
        w-full max-w-md mx-auto overflow-hidden
        ${className}
      `}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('accessControl.title')}</h3>
            <p className="text-[10px] text-gray-400">Q4_Report_2025.pdf</p>
          </div>
        </div>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal body */}
      <div className="px-5 py-4 space-y-4">
        {/* Access type toggles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('accessControl.publicLink')}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('accessControl.publicLinkHint')}</p>
            </div>
            <Toggle on={false} />
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
            <div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('accessControl.private')}</span>
              <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-0.5">{t('accessControl.privateHint')}</p>
            </div>
            <Toggle on={true} />
          </div>
        </div>

        {/* Share with input */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
            {t('accessControl.shareWith')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-1.5 py-0.5">
              @
            </span>
            <input
              type="text"
              placeholder="username"
              className="
                w-full pl-12 pr-3 py-2 text-xs
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl
                placeholder-gray-400 dark:placeholder-gray-500
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
              "
            />
          </div>
        </div>

        {/* Permission options */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
            {t('accessControl.permission.label')}
          </label>
          <div className="space-y-1.5">
            {/* View only — selected */}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 has-[:focus]:ring-2 has-[:focus]:ring-primary-500/30">
              <Radio checked={true} />
              <div className="flex-1">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('accessControl.permission.view')}</span>
                <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-0.5">{t('accessControl.permission.viewHint')}</p>
              </div>
            </label>
            {/* View + Download */}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              <Radio checked={false} />
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('accessControl.permission.viewDownload')}</span>
                <p className="text-[10px] text-gray-400 mt-0.5">{t('accessControl.permission.viewDownloadHint')}</p>
              </div>
            </label>
            {/* View + Download + Print */}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              <Radio checked={false} />
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('accessControl.permission.viewDownloadPrint')}</span>
                <p className="text-[10px] text-gray-400 mt-0.5">{t('accessControl.permission.viewDownloadPrintHint')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Expiry + Max downloads row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('accessControl.expires')}
            </label>
            <input
              type="date"
              className="
                w-full px-3 py-2 text-xs
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl
                text-gray-700 dark:text-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                [color-scheme:light]
              "
              defaultValue="2026-03-15"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('accessControl.maxDownloads')}
            </label>
            <input
              type="number"
              className="
                w-full px-3 py-2 text-xs
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl
                text-gray-700 dark:text-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
              "
              defaultValue={10}
            />
          </div>
        </div>

        {/* Passcode row */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('accessControl.passcode')}
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder={t('accessControl.passcodePlaceholder')}
              className="
                w-full px-3 pr-8 py-2 text-xs
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl
                placeholder-gray-400 dark:placeholder-gray-500
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
              "
              defaultValue="••••••••"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[9px] text-amber-500 font-medium">Set</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        {/* Left: revoke */}
        <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          {t('accessControl.revoke')}
        </button>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button className="
            flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium
            border border-gray-200 dark:border-gray-700
            text-gray-600 dark:text-gray-400
            rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800
            transition-colors
          ">
            <Copy className="w-3.5 h-3.5" />
            {t('accessControl.copyLink')}
          </button>
          <button className="
            flex items-center gap-1.5 px-4 py-2 text-xs font-semibold
            bg-gray-900 dark:bg-white
            text-white dark:text-gray-900
            rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100
            transition-colors shadow-sm
          ">
            {t('accessControl.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
