import { cn } from '@/utils/helpers';
import { User } from 'lucide-react';

interface MockupFrameProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export default function MockupFrame({
  children,
  className,
  light = false,
}: MockupFrameProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden shadow-2xl',
        'border border-gray-200 dark:border-gray-800',
        className
      )}
    >
      {/* Browser chrome top bar */}
      <div
        className={cn(
          'h-9 flex items-center px-3 gap-2',
          light ? 'bg-gray-100' : 'bg-[#1e2030]'
        )}
      >
        {/* Traffic light dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>

        {/* URL bar */}
        <div
          className={cn(
            'flex-1 flex justify-center',
            light
              ? 'bg-gray-200 text-gray-500'
              : 'bg-[#2a2d3e] text-gray-400'
          )}
        >
          <div
            className={cn(
              'px-3 py-0.5 rounded-md text-xs font-mono',
              light
                ? 'bg-gray-200'
                : 'bg-[#2a2d3e]'
            )}
          >
            app.mydocuments.io/library
          </div>
        </div>

        {/* User avatar placeholder */}
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            light
              ? 'bg-gray-200 text-gray-500'
              : 'bg-[#2a2d3e] text-gray-400'
          )}
        >
          <User size={14} />
        </div>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          'min-h-[200px]',
          light ? 'bg-white' : 'bg-[#0B0F19]'
        )}
      >
        {children}
      </div>
    </div>
  );
}
