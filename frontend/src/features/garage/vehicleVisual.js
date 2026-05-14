/** Map free-text color to a display swatch (demo-friendly, not paint-accurate). */
export function colorToSwatch(colorStr) {
  const raw = (colorStr || '').trim().toLowerCase();
  if (!raw) {
    return {
      dot: 'linear-gradient(135deg, #64748b, #94a3b8)',
      glow: 'rgba(100, 116, 139, 0.35)',
      label: 'Not set',
    };
  }

  const pairs = [
    ['black', '#0f172a', 'rgba(15, 23, 42, 0.45)'],
    ['charcoal', '#1e293b', 'rgba(30, 41, 59, 0.4)'],
    ['white', '#f8fafc', 'rgba(148, 163, 184, 0.35)'],
    ['pearl', '#e2e8f0', 'rgba(226, 232, 240, 0.45)'],
    ['silver', '#cbd5e1', 'rgba(148, 163, 184, 0.4)'],
    ['gray', '#94a3b8', 'rgba(148, 163, 184, 0.4)'],
    ['grey', '#94a3b8', 'rgba(148, 163, 184, 0.4)'],
    ['red', '#ef4444', 'rgba(239, 68, 68, 0.4)'],
    ['blue', '#3b82f6', 'rgba(59, 130, 246, 0.4)'],
    ['navy', '#1e3a8a', 'rgba(30, 58, 138, 0.45)'],
    ['green', '#22c55e', 'rgba(34, 197, 94, 0.35)'],
    ['yellow', '#eab308', 'rgba(234, 179, 8, 0.35)'],
    ['gold', '#ca8a04', 'rgba(202, 138, 4, 0.35)'],
    ['orange', '#f97316', 'rgba(249, 115, 22, 0.35)'],
    ['brown', '#92400e', 'rgba(146, 64, 14, 0.35)'],
    ['beige', '#d6c0a3', 'rgba(214, 192, 163, 0.4)'],
    ['purple', '#a855f7', 'rgba(168, 85, 247, 0.35)'],
  ];

  for (const [key, dot, glow] of pairs) {
    if (raw.includes(key)) {
      return { dot, glow, label: colorStr.trim() };
    }
  }

  return {
    dot: 'linear-gradient(135deg, #06b6d4, #6366f1)',
    glow: 'rgba(6, 182, 212, 0.35)',
    label: colorStr.trim(),
  };
}
