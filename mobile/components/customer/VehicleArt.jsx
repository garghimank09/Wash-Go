import Svg, { Path, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const COLOR_HEX = {
  white: '#e8eef2',
  black: '#1f2937',
  silver: '#cbd5e1',
  grey: '#94a3b8',
  gray: '#94a3b8',
  red: '#dc2626',
  blue: '#2563eb',
  brown: '#78350f',
};

export function resolveBodyColor(colorName, fallback = '#9bbcd6') {
  if (!colorName) return fallback;
  const key = String(colorName).trim().toLowerCase();
  return COLOR_HEX[key] || fallback;
}

export default function VehicleArt({
  width = 180,
  height = 110,
  bodyColor = '#9bbcd6',
  accentColor = '#0e7490',
  shadow = true,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 130">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="1" stopColor={bodyColor} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      {shadow ? (
        <Ellipse cx="110" cy="118" rx="92" ry="6" fill="#000" opacity="0.08" />
      ) : null}
      <G>
        <Path
          d="M22 95 C26 78 38 70 56 68 L80 50 C88 44 98 40 110 40 L142 40 C160 40 176 48 188 62 L198 78 C204 82 208 90 208 100 C208 106 204 110 198 110 L24 110 C18 110 14 104 18 100 Z"
          fill="url(#bodyGrad)"
          stroke={accentColor}
          strokeWidth="2"
          strokeOpacity="0.4"
        />
        <Path
          d="M70 68 L86 52 C92 48 100 46 108 46 L138 46 C150 46 162 52 170 62 L178 72 Z"
          fill="#ffffff"
          opacity="0.55"
        />
        <Path
          d="M122 46 L122 72 L178 72"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.7"
          fill="none"
        />
      </G>
      <G>
        <Ellipse cx="62" cy="108" rx="14" ry="14" fill="#0f172a" />
        <Ellipse cx="62" cy="108" rx="6" ry="6" fill="#475569" />
        <Ellipse cx="170" cy="108" rx="14" ry="14" fill="#0f172a" />
        <Ellipse cx="170" cy="108" rx="6" ry="6" fill="#475569" />
      </G>
      <Path
        d="M192 86 L202 86"
        stroke={accentColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </Svg>
  );
}
