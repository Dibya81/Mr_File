import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/adminHelpers';

interface AdminKpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | null;
  trendValue?: string;
  className?: string;
}

export default function AdminKpiCard({
  label,
  value,
  subValue,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  trend,
  trendValue,
  className,
}: AdminKpiCardProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          )}>
            {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
}
