import { useCallback, useRef, useState } from 'react';

const MAX_EFFECTS = 6;
const INTERVAL_MS = 160;

/**
 * Subtle pointer ripples + droplets for hero car visual.
 */
export function useHeroPointerFx(enabled) {
  const stageRef = useRef(null);
  const lastRef = useRef(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState(0.6);
  const [effects, setEffects] = useState([]);

  const handlePointerMove = useCallback(
    (event) => {
      if (!enabled || !stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      const dist = Math.hypot(nx, ny);

      setTilt({ x: nx * 8, y: ny * 5 });
      setGlow(0.55 + Math.min(0.35, (1 - dist) * 0.4));

      const now = Date.now();
      if (now - lastRef.current < INTERVAL_MS) return;
      lastRef.current = now;

      const angle = Math.atan2(ny, nx) * (180 / Math.PI);
      const ripple = { id: now, kind: 'ripple', x, y, size: 40 + Math.random() * 20 };
      const drops = [0, 1, 2].map((i) => ({
        id: now + i + 1,
        kind: 'drop',
        x,
        y,
        angle: angle + (i - 1) * 24,
        dist: 14 + Math.random() * 18,
        size: 3 + Math.random() * 2,
      }));

      setEffects((prev) => [...prev, ripple, ...drops].slice(-MAX_EFFECTS));

      window.setTimeout(() => {
        setEffects((prev) => prev.filter((e) => e.id !== ripple.id));
      }, 1000);
      drops.forEach((d, i) => {
        window.setTimeout(() => {
          setEffects((prev) => prev.filter((e) => e.id !== d.id));
        }, 750 + i * 80);
      });
    },
    [enabled],
  );

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlow(0.6);
  }, []);

  return { stageRef, tilt, glow, effects, handlePointerMove, handlePointerLeave };
}
