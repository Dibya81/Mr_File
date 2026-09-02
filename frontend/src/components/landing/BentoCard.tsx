import { cn } from '@/utils/helpers';

interface BentoCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  body?: string;
  className?: string;
  wide?: boolean;
  tall?: boolean;
  spotlight?: boolean;
}

export default function BentoCard({
  children,
  icon,
  title,
  body,
  className,
  wide = false,
  tall = false,
  spotlight = true,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm',
        // Spotlight effect
        spotlight && 'bento-spotlight',
        // Grid span utilities
        wide && 'md:col-span-2',
        tall && 'md:row-span-2',
        className
      )}
    >
      {/* Header section with icon, title, and body */}
      {(icon || title || body) && (
        <div className="mb-4">
          {icon && (
            <div className="mb-3 w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-base font-semibold text-white mb-1">
              {title}
            </h3>
          )}
          {body && (
            <p className="text-sm text-slate-400 leading-relaxed">
              {body}
            </p>
          )}
        </div>
      )}

      {/* Children content */}
      {children}
    </div>
  );
}
