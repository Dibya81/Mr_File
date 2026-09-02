import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sliderX, setSliderX] = useState(50);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;

    const measureWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    measureWidth();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Clamp slider position between 0 and 100
  const clamp = (value: number) => Math.min(100, Math.max(0, value));

  // Handle drag
  const handleDrag = (_: unknown, info: { point: { x: number } }) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((info.point.x - rect.left) / rect.width) * 100;
    setSliderX(clamp(percentage));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl select-none"
      style={{ cursor: 'ew-resize' }}
    >
      {/* After layer (full width, underneath) */}
      <div className="relative w-full">{after}</div>

      {/* Before layer (clipped from left) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderX}%` }}
      >
        {before}
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/50 dark:bg-white/30 z-10"
        style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}
      />

      {/* Draggable handle */}
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragMomentum={false}
        dragElastic={0}
        onDrag={handleDrag}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-20',
          'w-10 h-10 rounded-full cursor-ew-resize'
        )}
        style={{ left: `${sliderX}%`, transform: 'translate(-50%, -50%)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-full h-full rounded-full glass flex items-center justify-center shadow-lg">
          <ArrowLeftRight size={18} className="text-gray-700 dark:text-gray-200" />
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-1 rounded-md bg-black/50 dark:bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-1 rounded-md bg-black/50 dark:bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
          {afterLabel}
        </span>
      </div>
    </div>
  );
}
