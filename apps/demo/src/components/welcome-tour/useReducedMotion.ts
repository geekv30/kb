// Tiny helper: subscribe to `prefers-reduced-motion: reduce`.
// Returns true when the user has expressed a preference for reduced motion.

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const handle = (event: MediaQueryListEvent) => setReduce(event.matches);
    // Safari < 14 only supports addListener/removeListener.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handle);
      return () => mql.removeEventListener('change', handle);
    }
    mql.addListener(handle);
    return () => mql.removeListener(handle);
  }, []);

  return reduce;
}
