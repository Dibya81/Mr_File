import { cn } from '@/utils/helpers';

type GlowVariant = 'blue' | 'indigo' | 'purple';

interface GlowBackgroundProps {
  className?: string;
  color?: GlowVariant;
  variant?: GlowVariant;
}

const colorMap: Record<GlowVariant, string> = {
  blue: 'rgba(59, 130, 246, 0.3)',
  indigo: 'rgba(99, 102, 241, 0.3)',
  purple: 'rgba(168, 85, 247, 0.3)',
};

export default function GlowBackground({
  className,
  color = 'blue',
  variant,
}: GlowBackgroundProps) {
  // Support both `color` and `variant` props for flexibility
  const resolvedColor = colorMap[variant ?? color];

  return (
    <div
      className={cn('absolute inset-0 -z-10', className)}
      style={{
        background: `radial-gradient(800px circle at 50% 50%, ${resolvedColor}, transparent 70%)`,
      }}
    />
  );
}
