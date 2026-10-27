import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Border-box height of the element the returned callback ref is attached
 * to, kept live with a ResizeObserver. 0 while nothing is attached.
 */
export function useElementHeight<T extends HTMLElement>(): readonly [(el: T | null) => void, number] {
  const [height, setHeight] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) {
      setHeight(0);
      return;
    }
    const measure = () => setHeight(el.getBoundingClientRect().height);
    measure();
    observer.current = new ResizeObserver(measure);
    observer.current.observe(el);
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);
  return [ref, height] as const;
}
