import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Gives Recharts a real pixel size after layout. Using width/height "100%" inside
 * ResponsiveContainer often logs width(-1)/height(-1) on first paint (grid, lazy, Strict Mode).
 */
export function ChartMeasuredContainer({ className, style, children }) {
  const ref = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      const r = el.getBoundingClientRect();
      const width = Math.floor(r.width);
      const height = Math.floor(r.height);
      if (width <= 0 || height <= 0) return;
      setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    update();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {box.width > 0 && box.height > 0 ? children({ width: box.width, height: box.height }) : null}
    </div>
  );
}
