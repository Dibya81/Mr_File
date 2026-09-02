import { useEffect, useState, RefObject } from 'react';

export function useInView(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}
